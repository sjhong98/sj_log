// @ts-nocheck

import { relations } from 'drizzle-orm/relations'
import {
  usersInAuth,
  user,
  financeAccount,
  financeLog,
  diary,
  comment
} from './schema'

export const userRelations = relations(user, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [user.uid],
    references: [usersInAuth.id]
  })
}))

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  users: many(user),
  financeLogs: many(financeLog),
  comments: many(comment),
  financeAccounts: many(financeAccount)
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
