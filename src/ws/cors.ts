const DEFAULT_ORIGINS = [
  'https://finflow-frontend-self.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
]

const envOrigins =
  process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean) ?? []

export const ALLOWED_ORIGINS: string[] =
  envOrigins.length > 0 ? envOrigins : DEFAULT_ORIGINS