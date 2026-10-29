import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
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
    if (!form.get('title').trim()) return setError('Give your path a title.')
    setBusy(true)
    setError('')

    try {
      const roadmap = await createRoadmap(user.id, id, form.get('title'), form.get('description'))
      navigate(`/my-path/${roadmap.id}`) // navigate to the newly created roadmap
    } catch {
      setError('Could not save your path. Please try again.')
    } finally {
      setBusy(false) // reset the busy state
    }
  }

  return (
    <>
      <h1>Create a path</h1>
      <form onSubmit={submit}>
        <fieldset className="grid min-w-0 gap-3 m-0 mb-4 border-0 p-0 [&_input]:min-w-0 [&_input]:p-3 [&_input]:[font:inherit] [&_textarea]:min-w-0 [&_textarea]:p-3 [&_textarea]:[font:inherit]" disabled={busy}>
         <label htmlFor="roadmap-title">Title</label>
          <input id="roadmap-title" name="title" maxLength={200} required />
          <label htmlFor="roadmap-description">Description</label>
          <textarea id="roadmap-description" name="description" maxLength={5000} rows={4} />
          <button className="min-w-0 p-3 [font:inherit] cursor-pointer disabled:cursor-wait" type="submit">{busy ? 'Saving...' : 'Create path'}</button>
        </fieldset>
      </form>
      <Link to="/create-path/youtube" className="mx-1 mt-1 mb-4 block rounded-lg border border-accent bg-white px-4 py-3 text-center text-base text-accent no-underline">Create a path from YouTube</Link>
      {error && <p className="text-[#9e2020]" role="alert">{error}</p>}
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/my-path">Back to my paths</Link>
    </>
  )
}
