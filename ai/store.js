import { randomUUID } from 'node:crypto'
import { lessonBlocks } from './generate.js'

const fields = 'id, video_id, source_url, status, attempts, lesson_id, source_title, source_language, error, created_at, updated_at'

export function createStore(pool) {
  return {
    async enqueue(video) {
      const result = await pool.query(`
        insert into ai_private.import_jobs (video_id, source_url) values ($1, $2)
        on conflict (video_id) do update set video_id = excluded.video_id
        returning ${fields}
      `, [video.videoId, video.url])
      return result.rows[0]
    },
    async list(selected = null) {
      return (await pool.query(`
        select ${fields} from ai_private.import_jobs
        where id in (select id from ai_private.import_jobs order by created_at desc limit 100) or id = $1
        order by created_at desc
      `, [selected])).rows
    },
    async get(id) {
      return (await pool.query(`select ${fields} from ai_private.import_jobs where id = $1`, [id])).rows[0]
    },
    async lesson(id) {
      const { rows } = await pool.query(`
        select l.id, l.title, l.description, l.is_published, l.needs_review,
          coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'type', b.type, 'content', b.content, 'position', b.position) order by b.position)
          from public.lesson_blocks b where b.lesson_id = l.id), '[]'::jsonb) as blocks
        from public.lessons l join ai_private.import_jobs j on j.lesson_id = l.id
        where j.id = $1 and j.status = 'completed'
      `, [id])
      return rows[0]
    },
    async retry(id) {
      return (await pool.query(`
        update ai_private.import_jobs set status = 'queued', attempts = 0, error = null,
          available_at = now(), lease_id = null, lease_until = null, updated_at = now()
        where id = $1 and status = 'failed' returning ${fields}
      `, [id])).rows[0]
    },
    async claim() {
      await pool.query(`
        update ai_private.import_jobs set status = 'failed', lease_id = null, lease_until = null,
          error = 'The import stopped repeatedly. Check the server and retry.', updated_at = now()
        where status in ('extracting', 'generating') and lease_until < now() and attempts >= 3
      `)
      return (await pool.query(`
        with next_job as (
          select id from ai_private.import_jobs
          where attempts < 3 and ((status = 'queued' and available_at <= now())
            or (status in ('extracting', 'generating') and lease_until < now()))
          order by created_at for update skip locked limit 1
        )
        update ai_private.import_jobs j set status = 'extracting', attempts = attempts + 1,
          lease_id = $1, lease_until = now() + interval '10 minutes', error = null, updated_at = now()
        from next_job where j.id = next_job.id returning j.*
      `, [randomUUID()])).rows[0]
    },
    async generating(job, source) {
      const { rows } = await pool.query(`
        update ai_private.import_jobs set status = 'generating', source_title = $3,
          source_language = $4, updated_at = now()
        where id = $1 and lease_id = $2 and status = 'extracting' and lease_until > now() returning id
      `, [job.id, job.lease_id, source.title, source.language])
      return rows.length > 0
    },
    async finish(job, lesson, source) {
      const client = await pool.connect()
      try {
        await client.query('begin')
        const { rows } = await client.query(`
          select id from ai_private.import_jobs where id = $1 and lease_id = $2
          and status = 'generating' and lease_until > now() for update
        `, [job.id, job.lease_id])
        if (!rows.length) { await client.query('rollback'); return false }
        await client.query(`
          insert into public.lessons (id, owner_id, title, description, is_published, needs_review)
          values ($1, null, $2, $3, false, true)
        `, [job.id, lesson.title, lesson.description])
        for (const block of lessonBlocks(lesson, source)) {
          await client.query(`
            insert into public.lesson_blocks (id, lesson_id, type, content, position) values ($1, $2, $3, $4, $5)
          `, [block.id, job.id, block.type, JSON.stringify(block.content), block.position])
        }
        await client.query(`
          update ai_private.import_jobs set status = 'completed', lesson_id = $1, error = null,
            lease_id = null, lease_until = null, updated_at = now() where id = $1
        `, [job.id])
        await client.query('commit')
        return true
      } catch (error) {
        await client.query('rollback')
        throw error
      } finally { client.release() }
    },
    async fail(job, message, retryable) {
      const retry = retryable && job.attempts < 3
      await pool.query(`
        update ai_private.import_jobs set status = $3, error = $4, lease_id = null, lease_until = null,
          available_at = now() + ($5 * interval '1 second'), updated_at = now()
        where id = $1 and lease_id = $2 and status in ('extracting', 'generating')
      `, [job.id, job.lease_id, retry ? 'queued' : 'failed', message, 30 * job.attempts])
    },
  }
}
