import { handlePathRequest } from '../../app/ai/path-handler.server.js'

export default request => handlePathRequest(request)

export const config = { path: '/api/generate-path' }
