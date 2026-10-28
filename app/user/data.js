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

const roadmapFields = 'id, owner_id, title, description, roadmap_lessons(lesson_id, position, lessons(id, owner_id, title))'

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

export function createRoadmap(userId, id, title, description) {
  return result(supabase.from('roadmaps').upsert({ id, owner_id: userId, title: title.trim(), description: description.trim() }, { onConflict: 'id' }).select('id').single())
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

export async function linkLesson(userId, roadmapId, lessonId) {
  const [roadmap] = await Promise.all([
    getRoadmap(userId, roadmapId),
    result(supabase.from('lessons').select('id').eq('id', lessonId).eq('owner_id', userId).single()),
  ])
  if (roadmap.owner_id !== userId) throw new Error('This roadmap belongs to someone else.')
  if (roadmap.lessons.some(lesson => lesson.id === lessonId)) return
  const position = Math.max(-1, ...roadmap.roadmap_lessons.map(link => link.position)) + 1
  return result(supabase.from('roadmap_lessons').insert({ roadmap_id: roadmapId, lesson_id: lessonId, position }))
}
