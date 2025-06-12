import {InferSelectModel} from "drizzle-orm";

import { comment,devLog,devLogGroup,devLogTag,devLogTagRelation,diary,financeAccount,financeLog,user } from '../supabase/schema'

export type commentType = InferSelectModel<typeof comment> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogType = InferSelectModel<typeof devLog> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogGroupType = InferSelectModel<typeof devLogGroup> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogTagType = InferSelectModel<typeof devLogTag> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogTagRelationType = InferSelectModel<typeof devLogTagRelation> & { pk?: number; created_at?: Date; updated_at?: Date }
export type diaryType = InferSelectModel<typeof diary> & { pk?: number; created_at?: Date; updated_at?: Date }
export type financeAccountType = InferSelectModel<typeof financeAccount> & { pk?: number; created_at?: Date; updated_at?: Date }
export type financeLogType = InferSelectModel<typeof financeLog> & { pk?: number; created_at?: Date; updated_at?: Date }
export type userType = InferSelectModel<typeof user> & { pk?: number; created_at?: Date; updated_at?: Date }
