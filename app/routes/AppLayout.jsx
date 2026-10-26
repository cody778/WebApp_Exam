import { Link, Outlet } from 'react-router'

export default function AppLayout() {
  return (
    <>
      <Outlet />
      <nav aria-label="Main navigation">
        <Link to="/profile">Profile</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/my-skills">My skills</Link>
        <Link to="/home">Home</Link>
      </nav>
    </>
  )
}
