import { drizzle } from 'drizzle-orm/node-postgres'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5ZGhxcm9oaHBnd3liaGxod3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDMxMzIsImV4cCI6MjA1OTc3OTEzMn0.tqL6m2AdjgZ0bYTl5hgDO8eAWfUNIEhn1q_ogJD2T1w'

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
)

export default db
