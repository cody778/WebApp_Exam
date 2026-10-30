import { Outlet } from 'react-router'
import AppNav, { GuestNav } from '../components/AppNav.jsx'
import { useAuth } from '../user/AuthProvider.jsx'

/** App shell. Signed-in people get the app bar; signed-out visitors on public pages get the guest bar. */
export default function AppLayout() {
  const { user, loading } = useAuth()
  return (
    <div className="app-frame box-border [&_*]:box-border mx-auto flex min-h-screen w-full min-w-0 max-w-md flex-col px-4 pt-0 pb-6 font-sans text-ink lg:max-w-6xl lg:px-8 has-[.path-generation]:bg-white has-[.path-page]:bg-white lg:has-[.path-page]:max-w-none lg:has-[.path-page]:px-0">
      {user ? <AppNav /> : loading ? <div className="h-[4.5rem] shrink-0" aria-busy="true" /> : <GuestNav />}
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
