import { supabase } from './client.js'

async function result(query) { // disable eslint rule for the function to return error instead of throwing it
  const { data, error } = await query
  if (error) throw error
  return data
}

async function withProgress(userId, lessons) {
  if (!lessons.length) return []
  const progress = await result(supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId).in('lesson_id', [...new Set(lessons.map(lesson => lesson.id))]))
  const completed = new Set(progress.map(row => row.lesson_id))
  return lessons.map(lesson => ({ ...lesson, completed: completed.has(lesson.id) }))
}

async function withRoadmapLessons(userId, roadmaps) { 
  const lessons = roadmaps.flatMap(roadmap => roadmap.roadmap_lessons.map(link => link.lessons).filter(Boolean))
  const progress = await withProgress(userId, lessons)
  const byId = new Map(progress.map(lesson => [lesson.id, lesson]))
  return roadmaps.map(roadmap => ({
    ...roadmap,
    lessons: [...roadmap.roadmap_lessons].sort((a, b) => a.position - b.position).map(link => byId.get(link.lesson_id) ?? { id: link.lesson_id, unavailable: true }),
  }))
}

const roadmapFields = 'id, owner_id, title, description, materials, roadmap_lessons(lesson_id, position, lessons(id, owner_id, title))'

export async function listRoadmaps(userId) {
  const roadmaps = await result(supabase.from('roadmaps').select(roadmapFields).eq('owner_id', userId).order('created_at', { ascending: false }))
  return withRoadmapLessons(userId, roadmaps)
}

export async function getRoadmap(userId, id) {
  const roadmap = await result(supabase.from('roadmaps').select(roadmapFields).eq('id', id).single())
  return (await withRoadmapLessons(userId, [roadmap]))[0]
}

export async function listPublishedRoadmaps(userId) {
  const roadmaps = await result(supabase.from('roadmaps').select(roadmapFields).eq('is_published', true).order('created_at', { ascending: false }))
  return withRoadmapLessons(userId, roadmaps)
}

export function createRoadmap(userId, id, title, description, materials) {
  const row = { id, owner_id: userId, title: title.trim(), description: description.trim() }
  if (materials) row.materials = materials
  return result(supabase.from('roadmaps').upsert(row, { onConflict: 'id' }).select('id').single())
}

/** Paths from other people that the user saved, with the user's progress on each. */
export async function listSavedRoadmaps(userId) {
  const rows = await result(supabase.from('saved_roadmaps').select(`roadmaps(${roadmapFields})`).eq('user_id', userId).order('created_at', { ascending: false }))
  return withRoadmapLessons(userId, rows.map(row => row.roadmaps).filter(Boolean))
}

export function listProjects(userId) {
  return result(supabase.from('projects').select('id, title, description').eq('owner_id', userId).order('created_at', { ascending: false }))
}

export function getOwnedProject(userId, id) {
  return result(supabase.from('projects').select('id, title, description, blocks').eq('owner_id', userId).eq('id', id).single())
}

export function saveProject(userId, id, { title, description, blocks }) {
  return result(supabase.from('projects').upsert({ id, owner_id: userId, title: title.trim(), description: description.trim(), blocks }, { onConflict: 'id' }).select('id').single())
}

export async function listLessons(userId) {
  const lessons = await result(supabase.from('lessons').select('id, title').eq('owner_id', userId).order('created_at', { ascending: false }))
  return withProgress(userId, lessons)
}

const lessonFields = 'id, owner_id, title, lesson_blocks(id, type, content, position), roadmap_lessons(roadmap_id)' //We do not need the roadmap data, just the roadmap id for the lesson

export async function getLesson(userId, id) {
  const lesson = await result(supabase.from('lessons').select(lessonFields).eq('id', id).single())
  lesson.blocks = lesson.lesson_blocks.sort((a, b) => a.position - b.position)
  return (await withProgress(userId, [lesson]))[0]
}

export async function getOwnedLesson(userId, id) {
  const lesson = await result(supabase.from('lessons').select(lessonFields).eq('owner_id', userId).eq('id', id).single())
  return { ...lesson, blocks: lesson.lesson_blocks.sort((a, b) => a.position - b.position) }
}

export function saveLesson(id, roadmapId, title, blocks) { // id is null for the new lesson 
  return result(supabase.rpc('save_lesson', { p_id: id, p_title: title.trim(), p_blocks: blocks, p_roadmap_id: roadmapId ?? null }))
}

export function setLessonCompleted(userId, id, completed) {
  const query = completed
    ? supabase.from('lesson_progress').upsert({ user_id: userId, lesson_id: id }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true })
    : supabase.from('lesson_progress').delete().eq('user_id', userId).eq('lesson_id', id)
  return result(query)
}

/** Counts are supplementary; a statistics outage should not make the path itself unavailable. */
async function getRoadmapStats(id) {
  const { data, error } = await supabase.rpc('roadmap_stats', { p_roadmap_id: id })
  if (error) {
    console.warn('Could not load path statistics.', { code: error.code, message: error.message })
    return { saves: 0, forks: 0 }
  }

  const stats = Array.isArray(data) ? data[0] : data
  return stats ?? { saves: 0, forks: 0 }
}

/** A path with each step's blocks, whether the user saved it, and its save and fork counts, for the path page. */
export async function getPath(userId, id) {
  const [roadmap, saves, stats] = await Promise.all([
    getRoadmap(userId, id),
    result(supabase.from('saved_roadmaps').select('roadmap_id').eq('user_id', userId).eq('roadmap_id', id)),
    getRoadmapStats(id),
  ])
  const ids = roadmap.lessons.filter(lesson => !lesson.unavailable).map(lesson => lesson.id)
  const rows = ids.length ? await result(supabase.from('lessons').select('id, lesson_blocks(id, type, content, position)').in('id', ids)) : []
  const blocks = new Map(rows.map(row => [row.id, [...row.lesson_blocks].sort((a, b) => a.position - b.position).map(({ id, type, content }) => ({ id, type, content }))]))
  return {
    ...roadmap,
    saved: saves.length > 0,
    saves: Number(stats?.saves ?? 0),
    forks: Number(stats?.forks ?? 0),
    lessons: roadmap.lessons.map(lesson => ({ ...lesson, blocks: blocks.get(lesson.id) ?? [] })),
  }
}

export function setPathSaved(userId, id, saved) {
  const query = saved
    ? supabase.from('saved_roadmaps').upsert({ user_id: userId, roadmap_id: id }, { onConflict: 'user_id,roadmap_id', ignoreDuplicates: true })
    : supabase.from('saved_roadmaps').delete().eq('user_id', userId).eq('roadmap_id', id)
  return result(query)
}

/** Saves an edited path: details, every step, removed steps, and the new step order. */
export async function updatePath(userId, roadmap, { title, description, materials, steps }) {
  await createRoadmap(userId, roadmap.id, title, description, materials)
  for (const step of steps) await saveLesson(step.id, roadmap.id, step.title, step.blocks)
  const kept = new Set(steps.map(step => step.id))
  const removed = roadmap.lessons.map(lesson => lesson.id).filter(id => !kept.has(id))
  if (removed.length) await result(supabase.from('roadmap_lessons').delete().eq('roadmap_id', roadmap.id).in('lesson_id', removed))
  // Two passes so no two links share a position while they are being renumbered.
  for (const offset of [steps.length, 0]) {
    for (const [index, step] of steps.entries()) {
      await result(supabase.from('roadmap_lessons').update({ position: offset + index }).eq('roadmap_id', roadmap.id).eq('lesson_id', step.id))
    }
  }
}

/** Copies a path and its steps to the user's own paths. Returns the new path id. */
export async function forkPath(userId, path) {
  const id = crypto.randomUUID()
  await result(supabase.from('roadmaps').insert({ id, owner_id: userId, title: path.title, description: path.description ?? '', materials: path.materials ?? [], forked_from: path.id }))
  for (const lesson of path.lessons) {
    if (lesson.unavailable) continue
    const blocks = lesson.blocks.length ? lesson.blocks : [{ type: 'paragraph', content: { text: '' } }]
    await saveLesson(crypto.randomUUID(), id, lesson.title, blocks.map(block => ({ ...block, id: crypto.randomUUID() })))
  }
  return id
}

export async function linkLesson(userId, roadmapId, lessonId) {
  const [roadmap] = await Promise.all([
    getRoadmap(userId, roadmapId),
    result(supabase.from('lessons').select('id').eq('id', lessonId).eq('owner_id', userId).single()),
  ])
  if (roadmap.owner_id !== userId) throw new Error('This path belongs to someone else.')
  if (roadmap.lessons.some(lesson => lesson.id === lessonId)) return
  const position = Math.max(-1, ...roadmap.roadmap_lessons.map(link => link.position)) + 1
  return result(supabase.from('roadmap_lessons').insert({ roadmap_id: roadmapId, lesson_id: lessonId, position }))
}
