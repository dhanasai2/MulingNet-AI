// API base URL — in production (Vercel), point to the ngrok backend.
// In dev mode, use empty string so Vite's proxy handles it.
const API_BASE = import.meta.env.PROD
    ? 'https://unheaved-elina-roughly.ngrok-free.dev'
    : ''

export default API_BASE
