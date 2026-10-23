import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ImportLessons from './ImportLessons.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(<StrictMode><ImportLessons /></StrictMode>)
