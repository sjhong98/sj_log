import { InferSelectModel } from 'drizzle-orm'
import { devLog } from '@/supabase/schema'

export type DevLogType = InferSelectModel<typeof devLog>
