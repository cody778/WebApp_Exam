import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PathEditor, { newStep, secondaryButton } from '../components/PathEditor.jsx'
import PathShell, { authorName } from '../components/PathShell.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { createRoadmap, saveLesson } from '../user/data.js'

/** Create-path screen. The title, description, and steps are saved together. */
export default function CreateRoadmap() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const savedStepIds = useRef(new Set())
  const [id] = useState(() => crypto.randomUUID())
  const [initial] = useState(() => ({ title: '', description: '', steps: [newStep()] }))

  async function create({ title, description, materials, steps }) {
    const roadmap = await createRoadmap(user.id, id, title, description, materials)
    for (const step of steps) {
      if (savedStepIds.current.has(step.id)) continue
      await saveLesson(step.id, roadmap.id, step.title, step.blocks)
      savedStepIds.current.add(step.id)
    }
    navigate(`/my-path/${roadmap.id}`)
  }

  return (
    <PathShell crumb={{ to: '/home', label: 'My paths' }} current="New path">
      <PathEditor
        initial={initial}
        author={authorName(user)}
        submitLabel="Create path"
        onSubmit={create}
        autoFocusTitle
        secondary={
          <Link to="/create-path/youtube" className={secondaryButton}>
            Create a path from YouTube
          </Link>
        }
      />
    </PathShell>
  )
}
