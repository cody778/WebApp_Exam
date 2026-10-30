export const generationTimeoutMs = 5 * 60 * 1000
// Leave time for authentication and for the server to return its result or error.
export const generationRequestTimeoutMs = generationTimeoutMs + 30 * 1000
