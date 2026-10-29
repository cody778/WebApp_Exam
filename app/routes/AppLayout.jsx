import { Outlet } from 'react-router'
import AppNav from '../components/AppNav.jsx'

/** Signed-in shell. The top bar replaces the old footer on every page in this layout. */
export default function AppLayout() {
  return (
    <div className="app-frame mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 pt-4 pb-6 font-sans text-ink">
      <AppNav />
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
