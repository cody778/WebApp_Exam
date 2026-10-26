import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../user/AuthProvider.jsx'
import { createRoadmap } from '../user/data.js'

export default function CreateRoadmap() { //form to create a new roadmap
  const { user } = useAuth()
  const navigate = useNavigate()
  const [id] = useState(() => crypto.randomUUID())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) { // handle the submission
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget) // get the form data
    if (!form.get('title').trim()) return setError('Give your roadmap a title.')
    setBusy(true)
    setError('')

    try {
      const roadmap = await createRoadmap(user.id, id, form.get('title'), form.get('description'))
      navigate(`/my-roadmap/${roadmap.id}`) // navigate to the newly created roadmap
    } catch {
      setError('Could not save your roadmap. Please try again.')
    } finally {
      setBusy(false) // reset the busy state
    }
  }

  return (
    <>
      <h1>Create a roadmap</h1>
      <form onSubmit={submit}>
        <fieldset className= "userfields" disabled={busy}>
         <label htmlFor="roadmap-title">Title</label>
          <input id="roadmap-title" name="title" maxLength={200} required />
          <label htmlFor="roadmap-description">Description</label>
          <textarea id="roadmap-description" name="description" maxLength={5000} rows={4} />
          <button type="submit">{busy ? 'Saving...' : 'Create roadmap'}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      <Link to="/my-roadmap">Back to my roadmaps</Link>
    </>
  )
}
