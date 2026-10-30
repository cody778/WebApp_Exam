import { useAuth } from '../user/AuthProvider.jsx'
import { firstName } from '../user/profile.js'

/** Greeting that adds the signed-in person's first name, or stays generic for visitors. */
export default function WelcomeMessage() {
  const { user } = useAuth()
  const name = firstName(user)

  return (
    <section>
      <h2>{name ? `Welcome to Pathify, ${name}` : 'Welcome to Pathify'}</h2>
      <p>Here you can consolidate and overview everything you want to learn.</p>
    </section>
  )
}
