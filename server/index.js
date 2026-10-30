import { accessSync } from 'node:fs'
import { createApp } from './app.js'

accessSync(new URL('../build/client/index.html', import.meta.url))
const port = Number(process.env.PORT || 3000)
const server = createApp().listen(port, '0.0.0.0', () => {
  console.log(`Pathify is listening on port ${port}`)
})

process.on('SIGTERM', () => server.close())
