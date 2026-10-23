import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { ImportError, readJson } from './errors.js'

const run = promisify(execFile)
const videoIdPattern = /^[A-Za-z0-9_-]{11}$/

export function parseVideoUrl(value) {
  let url
  try { url = new URL(value) } catch { throw new ImportError('Enter a valid YouTube video URL.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new ImportError('Use an HTTPS YouTube video URL.')
  let id
  if (url.hostname === 'youtu.be') id = url.pathname.slice(1).replace(/\/$/, '')
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v')
    else id = url.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})\/?$/)?.[1]
  }
  if (!videoIdPattern.test(id ?? '')) throw new ImportError('Enter a YouTube video link, not a channel or playlist.')
  return { videoId: id, url: `https://www.youtube.com/watch?v=${id}` }
}

export function selectCaptions(info, language) {
  const tracks = []
  for (const [kind, entries] of [['manual', info.subtitles], ['automatic', info.automatic_captions]]) {
    for (const [code, formats] of Object.entries(entries ?? {})) {
      const track = formats.find(format => format.ext === 'json3')
      if (track) tracks.push({ ...track, language: code, kind })
    }
  }
  const score = track => (track.language === language ? 0 : track.language.startsWith(`${language}-`) ? 2 : track.language.endsWith('-orig') ? 4 : 6) + (track.kind === 'manual' ? 0 : 1)
  return tracks.sort((a, b) => score(a) - score(b))[0]
}

export function parseCaptions(payload) {
  const segments = []
  let size = 0
  for (const event of payload.events ?? []) {
    const text = (event.segs ?? []).map(segment => segment.utf8 ?? '').join('').replace(/\s+/g, ' ').trim()
    const start = Math.floor(event.tStartMs / 1000)
    if (!text || !Number.isFinite(start) || start < 0 || segments.at(-1)?.text === text) continue
    size += text.length
    if (size > 80000 || segments.length >= 5000) throw new ImportError('This transcript is too long. Choose a shorter video.')
    segments.push({ start, text })
  }
  if (size < 80) throw new ImportError('There is not enough spoken content to create a lesson.')
  return segments.sort((a, b) => a.start - b.start)
}

export function createExtractor({ executable = 'yt-dlp', language = 'en', execute = run, fetcher = fetch } = {}) {
  return async function extract(sourceUrl) {
    const video = parseVideoUrl(sourceUrl)
    let info
    try {
      const { stdout } = await execute(executable, [
        '--ignore-config', '--no-plugin-dirs', '--no-playlist', '--skip-download', '--dump-single-json',
        '--no-warnings', '--no-progress', '--socket-timeout', '20', '--retries', '1',
        '--js-runtimes', 'node', '--', video.url,
      ], { timeout: 120000, maxBuffer: 8000000, windowsHide: true, shell: false })
      info = JSON.parse(stdout)
    } catch (error) {
      if (error.code === 'ENOENT') throw new ImportError('yt-dlp is not installed or YTDLP_PATH is incorrect.')
      throw new ImportError('Could not read this video. It may be private, unavailable, or blocked by YouTube.', Boolean(error.killed))
    }
    if (info.id !== video.videoId) throw new ImportError('YouTube returned a different video.')
    if (info.is_live || !Number.isFinite(info.duration) || info.duration <= 0 || info.duration > 3600) throw new ImportError('Choose a recorded video no longer than 60 minutes.')
    const track = selectCaptions(info, language)
    if (!track) throw new ImportError('This video has no readable captions. Choose a captioned video.')
    let captionUrl
    try { captionUrl = new URL(track.url) } catch { throw new ImportError('The caption URL is invalid.') }
    if (captionUrl.protocol !== 'https:' || !['www.youtube.com', 'youtube.com'].includes(captionUrl.hostname) || captionUrl.pathname !== '/api/timedtext' || captionUrl.username || captionUrl.password || captionUrl.port) throw new ImportError('The caption provider returned an unsupported URL.')
    try {
      const response = await fetcher(captionUrl, { redirect: 'error', signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new ImportError('YouTube could not provide the captions.', response.status === 429 || response.status >= 500)
      const segments = parseCaptions(await readJson(response))
      if (segments.some(segment => segment.start > info.duration + 5)) throw new ImportError('The captions do not match the video duration.')
      return { ...video, title: String(info.title ?? 'YouTube lesson').slice(0, 500), language: track.language, duration: info.duration, segments }
    } catch (error) {
      if (error instanceof ImportError) throw error
      throw new ImportError('Could not load the video captions. Please try again.', true)
    }
  }
}
