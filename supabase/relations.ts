// @ts-nocheck

import { relations } from 'drizzle-orm/relations'
import {
  diary,
  comment,
  usersInAuth,
  financeAccount,
  financeLog,
  user,
  devLog,
  devLogTagRelation,
  devLogTag,
  devLogGroup
} from './schema'

export const commentRelations = relations(comment, ({ one }) => ({
  diary: one(diary, {
    fields: [comment.diaryPk],
    references: [diary.pk]
  }),
  usersInAuth: one(usersInAuth, {
    fields: [comment.uid],
    references: [usersInAuth.id]
  })
}))

export const diaryRelations = relations(diary, ({ many }) => ({
  comments: many(comment)
}))

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  comments: many(comment),
  financeLogs: many(financeLog),
  financeAccounts: many(financeAccount),
  users: many(user)
}))

export const financeLogRelations = relations(financeLog, ({ one }) => ({
  financeAccount: one(financeAccount, {
    fields: [financeLog.financeAccountPk],
    references: [financeAccount.pk]
  }),
  usersInAuth: one(usersInAuth, {
    fields: [financeLog.uid],
    references: [usersInAuth.id]
  })
}))

export const financeAccountRelations = relations(
  financeAccount,
  ({ one, many }) => ({
    financeLogs: many(financeLog),
    usersInAuth: one(usersInAuth, {
      fields: [financeAccount.uid],
      references: [usersInAuth.id]
    })
  })
)

export const userRelations = relations(user, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [user.uid],
    references: [usersInAuth.id]
  })
}))

export const devLogTagRelationRelations = relations(
  devLogTagRelation,
  ({ one }) => ({
    devLog: one(devLog, {
      fields: [devLogTagRelation.devLogPk],
      references: [devLog.pk]
    }),
    devLogTag: one(devLogTag, {
      fields: [devLogTagRelation.devLogTagPk],
      references: [devLogTag.pk]
    })
  })
)

export const devLogRelations = relations(devLog, ({ one, many }) => ({
  devLogTagRelations: many(devLogTagRelation),
  devLogGroup: one(devLogGroup, {
    fields: [devLog.groupPk],
    references: [devLogGroup.pk]
  })
}))

export const devLogTagRelations = relations(devLogTag, ({ many }) => ({
  devLogTagRelations: many(devLogTagRelation)
}))

export const devLogGroupRelations = relations(devLogGroup, ({ many }) => ({
  devLogs: many(devLog)
}))
