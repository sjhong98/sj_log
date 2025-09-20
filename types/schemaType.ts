import {InferSelectModel} from "drizzle-orm";

import { comment,devLog,devLogGroup,devLogTag,devLogTagRelation,diary,financeAccount,financeLog,name,nameTag,nameTagRelation,user } from '../supabase/schema'

export type commentType = Omit<InferSelectModel<typeof comment>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogType = Omit<InferSelectModel<typeof devLog>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogGroupType = Omit<InferSelectModel<typeof devLogGroup>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogTagType = Omit<InferSelectModel<typeof devLogTag>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type devLogTagRelationType = Omit<InferSelectModel<typeof devLogTagRelation>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type diaryType = Omit<InferSelectModel<typeof diary>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type financeAccountType = Omit<InferSelectModel<typeof financeAccount>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type financeLogType = Omit<InferSelectModel<typeof financeLog>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type nameType = Omit<InferSelectModel<typeof name>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type nameTagType = Omit<InferSelectModel<typeof nameTag>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type nameTagRelationType = Omit<InferSelectModel<typeof nameTagRelation>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
export type userType = Omit<InferSelectModel<typeof user>, 'pk' | 'createdAt' | 'updatedAt' | 'uid'> & { pk?: number; created_at?: Date; updated_at?: Date }
