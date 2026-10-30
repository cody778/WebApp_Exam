import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import { AuthProvider } from './user/AuthProvider.jsx'
import './index.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-full overflow-x-clip bg-transparent font-[system-ui,sans-serif] text-[#213547]">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="relative z-0 m-0 min-h-full overflow-x-clip bg-transparent before:fixed before:inset-0 before:-z-10 before:bg-[#f7f4ee] before:bg-[url('./assets/background.jpg')] before:bg-cover before:bg-center before:bg-no-repeat before:content-['']">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function HydrateFallback() {
  return <main className="mx-auto my-24 max-w-160 p-6"><p>Loading...</p></main>
}

export default function App() {
  return <AuthProvider><main className="mx-auto my-24 max-w-160 p-6 has-[.landing-page,.explore-page,.profile-page,.premium-page,.saved-path,.sashiko-path,.register-page,.sign-in-page,.app-frame]:m-0 has-[.landing-page,.explore-page,.profile-page,.premium-page,.saved-path,.sashiko-path,.register-page,.sign-in-page,.app-frame]:max-w-none has-[.landing-page,.explore-page,.profile-page,.premium-page,.saved-path,.sashiko-path,.register-page,.sign-in-page,.app-frame]:p-0"><Outlet /></main></AuthProvider>
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? error.status + ' ' + error.statusText
    : 'An unexpected error occurred.'
  return <main className="mx-auto my-24 max-w-160 p-6"><h1>{message}</h1></main>
}

