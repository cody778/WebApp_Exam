import { supabase } from './client.js'

// Browser queries include the signed-in session; database RLS remains the final permission check.
// Convert Supabase's { data, error } result into normal async errors.
async function result(query) {
  const { data, error } = await query
  if (error) throw error
  return data
}

async function withProgress(userId, lessons) {
  if (!lessons.length) return []
  if (!userId) return lessons.map(lesson => ({ ...lesson, completed: false }))
  const progress = await result(supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId).in('lesson_id', [...new Set(lessons.map(lesson => lesson.id))]))
  const completed = new Set(progress.map(row => row.lesson_id))
  return lessons.map(lesson => ({ ...lesson, completed: completed.has(lesson.id) }))
}

// Merge nested lesson links with completion state while preserving step order.
async function withRoadmapLessons(userId, roadmaps) { 
  const lessons = roadmaps.flatMap(roadmap => roadmap.roadmap_lessons.map(link => link.lessons).filter(Boolean))
  const progress = await withProgress(userId, lessons)
  const byId = new Map(progress.map(lesson => [lesson.id, lesson]))
  return roadmaps.map(roadmap => ({
    ...roadmap,
    lessons: [...roadmap.roadmap_lessons].sort((a, b) => a.position - b.position).map(link => byId.get(link.lesson_id) ?? { id: link.lesson_id, unavailable: true }),
  }))
}

const roadmapFields = 'id, owner_id, title, description, materials, cover_url, price, is_published, roadmap_lessons(lesson_id, position, lessons(id, owner_id, title))'

async function pathCounts(ids) {
  if (!ids.length) return new Map()
  // One database function returns all card totals instead of making three queries per path.
  const rows = await result(supabase.rpc('path_counts', { p_ids: ids }))
  return new Map(rows.map(row => [row.roadmap_id, { saves: Number(row.saves), forks: Number(row.forks), sales: Number(row.sales) }]))
}

async function authorNames(ownerIds) {
  const ids = [...new Set(ownerIds)]
  if (!ids.length) return new Map()
  const rows = await result(supabase.from('profiles').select('id, full_name, user_name').in('id', ids)).catch(() => [])
  return new Map(rows.map(row => [row.id, row.full_name || row.user_name || 'a Pathify member']))
}

async function idsFor(table, userId) {
  if (!userId) return new Set()
  const rows = await result(supabase.from(table).select('roadmap_id').eq('user_id', userId))
  return new Set(rows.map(row => row.roadmap_id))
}

// Explore cards combine path data with author, save, sale, and purchase data.
export async function listExplorePaths(userId) {
  const roadmaps = await result(supabase.from('roadmaps').select('id, owner_id, title, description, cover_url, price').eq('is_published', true).order('created_at', { ascending: true }))
  const [counts, authors, saved, purchased] = await Promise.all([
    pathCounts(roadmaps.map(roadmap => roadmap.id)),
    authorNames(roadmaps.map(roadmap => roadmap.owner_id)),
    idsFor('saved_roadmaps', userId),
    idsFor('purchased_roadmaps', userId),
  ])
  return roadmaps.map(roadmap => ({
    ...roadmap,
    author: authors.get(roadmap.owner_id) ?? 'a Pathify member',
    saves: 0, forks: 0, sales: 0,
    ...counts.get(roadmap.id),
    saved: saved.has(roadmap.id),
    purchased: purchased.has(roadmap.id),
  }))
}

export async function listCommissions(userId) {
  const [listed, bought] = await Promise.all([
    result(supabase.from('roadmaps').select(roadmapFields).eq('owner_id', userId).not('price', 'is', null).order('created_at', { ascending: false })),
    result(supabase.from('purchased_roadmaps').select(`roadmaps(${roadmapFields})`).eq('user_id', userId).order('created_at', { ascending: false })),
  ])
  const [own, purchased, counts] = await Promise.all([
    withRoadmapLessons(userId, listed),
    withRoadmapLessons(userId, bought.map(row => row.roadmaps).filter(Boolean)),
    pathCounts(listed.map(roadmap => roadmap.id)),
  ])
  return {
    listed: own.map(roadmap => ({ ...roadmap, sales: counts.get(roadmap.id)?.sales ?? 0 })),
    purchased,
  }
}

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

// Load only the parent path ID because the lesson page fetches the path separately.
const lessonFields = 'id, owner_id, title, lesson_blocks(id, type, content, position), roadmap_lessons(roadmap_id)'

export async function getLesson(userId, id) {
  const lesson = await result(supabase.from('lessons').select(lessonFields).eq('id', id).single())
  lesson.blocks = lesson.lesson_blocks.sort((a, b) => a.position - b.position)
  return (await withProgress(userId, [lesson]))[0]
}

export async function getOwnedLesson(userId, id) {
  const lesson = await result(supabase.from('lessons').select(lessonFields).eq('owner_id', userId).eq('id', id).single())
  return { ...lesson, blocks: lesson.lesson_blocks.sort((a, b) => a.position - b.position) }
}

// The database function saves the lesson, its blocks, and its path link together.
export function saveLesson(id, roadmapId, title, blocks) {
  return result(supabase.rpc('save_lesson', { p_id: id, p_title: title.trim(), p_blocks: blocks, p_roadmap_id: roadmapId ?? null }))
}

export function setLessonCompleted(userId, id, completed) {
  const query = completed
    ? supabase.from('lesson_progress').upsert({ user_id: userId, lesson_id: id }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true })
    : supabase.from('lesson_progress').delete().eq('user_id', userId).eq('lesson_id', id)
  return result(query)
}

// Load the path page data in parallel, then merge it into one result.
export async function getPath(userId, id) {
  const [roadmap, saved, purchased, counts] = await Promise.all([
    getRoadmap(userId, id),
    idsFor('saved_roadmaps', userId),
    idsFor('purchased_roadmaps', userId),
    pathCounts([id]),
  ])
  const ids = roadmap.lessons.filter(lesson => !lesson.unavailable).map(lesson => lesson.id)
  const [rows, authors] = await Promise.all([
    ids.length ? result(supabase.from('lessons').select('id, lesson_blocks(id, type, content, position)').in('id', ids)) : [],
    authorNames([roadmap.owner_id]),
  ])
  const blocks = new Map(rows.map(row => [row.id, [...row.lesson_blocks].sort((a, b) => a.position - b.position).map(({ id, type, content }) => ({ id, type, content }))]))
  return {
    ...roadmap,
    author: authors.get(roadmap.owner_id) ?? 'a Pathify member',
    saved: saved.has(id),
    purchased: purchased.has(id),
    saves: 0, forks: 0, sales: 0,
    ...counts.get(id),
    lessons: roadmap.lessons.map(lesson => ({ ...lesson, blocks: blocks.get(lesson.id) ?? [] })),
  }
}

export function completeOnboarding() {
  return result(supabase.auth.updateUser({ data: { onboarding_completed: true } }))
}

export function setPathPublished(id, published) {
  return result(supabase.from('roadmaps').update({ is_published: published }).eq('id', id))
}

export async function buyPath(userId, id) {
  await result(supabase.from('purchased_roadmaps').upsert({ user_id: userId, roadmap_id: id }, { onConflict: 'user_id,roadmap_id', ignoreDuplicates: true }))
  await setPathSaved(userId, id, true)
}

export async function forkPathById(userId, id) {
  return forkPath(userId, await getPath(userId, id))
}

export function setPathSaved(userId, id, saved) {
  const query = saved
    ? supabase.from('saved_roadmaps').upsert({ user_id: userId, roadmap_id: id }, { onConflict: 'user_id,roadmap_id', ignoreDuplicates: true })
    : supabase.from('saved_roadmaps').delete().eq('user_id', userId).eq('roadmap_id', id)
  return result(query)
}

// Save the path, its blocks, removals, and final step order.
export async function updatePath(userId, roadmap, { title, description, materials, steps }) {
  await createRoadmap(userId, roadmap.id, title, description, materials)
  for (const step of steps) await saveLesson(step.id, roadmap.id, step.title, step.blocks)
  const kept = new Set(steps.map(step => step.id))
  const removed = roadmap.lessons.map(lesson => lesson.id).filter(id => !kept.has(id))
  if (removed.length) await result(supabase.from('roadmap_lessons').delete().eq('roadmap_id', roadmap.id).in('lesson_id', removed))
  // Move positions out of range first to avoid temporary duplicates.
  for (const offset of [steps.length, 0]) {
    for (const [index, step] of steps.entries()) {
      await result(supabase.from('roadmap_lessons').update({ position: offset + index }).eq('roadmap_id', roadmap.id).eq('lesson_id', step.id))
    }
  }
}

// Forking creates new IDs so the copy can be edited independently.
export async function forkPath(userId, path) {
  if (path.price && !path.purchased && path.owner_id !== userId) throw new Error('Buy this path before forking it.')
  const id = crypto.randomUUID()
  await result(supabase.from('roadmaps').insert({ id, owner_id: userId, title: path.title, description: path.description ?? '', materials: path.materials ?? [], cover_url: path.cover_url ?? null, forked_from: path.id }))
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
