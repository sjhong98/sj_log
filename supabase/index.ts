import { drizzle } from 'drizzle-orm/node-postgres'

const db = drizzle(process.env.SUPABASE_URL ?? '')

export default db
