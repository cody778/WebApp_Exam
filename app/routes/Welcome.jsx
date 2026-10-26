import { Link } from 'react-router'
import WelcomeMessage from '../components/WelcomeMessage.jsx'

export default function Welcome() {
  return (
    <>
      <h1>Welcome.jsx</h1>
      <WelcomeMessage />
      <Link to="/introduction">Continue</Link>
    </>
  )
}
