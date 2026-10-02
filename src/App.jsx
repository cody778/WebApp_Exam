import { supabase } from './supabaseClient.js'

export default function App() {
  return (
    <main>
      <h1>React + Vite</h1>
      <p>Supabase is {supabase ? 'configured' : 'ready to configure'}.</p>
    </main>
  )
}
