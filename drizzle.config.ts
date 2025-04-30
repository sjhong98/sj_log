import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
config({ path: '.env' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_URL!
  },
  schemaFilter: ['public'],
  tablesFilter: ['*']
})
