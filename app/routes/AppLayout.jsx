import { Outlet } from 'react-router'
import AppNav from '../components/AppNav.jsx'

/** Signed-in shell. The top bar replaces the old footer on every page in this layout. */
export default function AppLayout() {
  return (
    <div className="app-frame box-border [&_*]:box-border mx-auto flex min-h-screen w-full min-w-0 max-w-md flex-col px-4 pt-0 pb-6 font-sans text-ink lg:max-w-6xl lg:px-8 has-[.path-generation]:bg-white has-[.path-page]:bg-white lg:has-[.path-page]:max-w-none lg:has-[.path-page]:px-0">
      <AppNav />
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
