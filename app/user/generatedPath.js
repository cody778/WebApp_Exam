export async function saveGeneratedPath(userId, draft, { createPath, saveLesson, onProgress = () => {} }) {
  await createPath(userId, draft.id, draft.title, draft.description)
  // Stable IDs make a retry update the same lessons instead of adding duplicates.
  for (const [index, lesson] of draft.lessons.entries()) {
    await saveLesson(lesson.id, draft.id, lesson.title, lesson.blocks)
    onProgress(index + 1)
  }
  return draft.id
}
