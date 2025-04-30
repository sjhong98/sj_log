// @ts-nocheck

import {
  pgTable,
  bigint,
  timestamp,
  text,
  uuid,
  varchar,
  foreignKey
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const diary = pgTable('diary', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  pk: bigint({ mode: 'number' })
    .primaryKey()
    .generatedByDefaultAsIdentity({
      name: 'diary_pk_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1
    }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  content: text(),
  date: timestamp({ mode: 'string' }),
  uid: uuid().defaultRandom(),
  title: varchar(),
  contentText: text(),
  thumbnail: text()
})

export const user = pgTable(
  'user',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    pk: bigint({ mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: 'user_id_seq',
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 9223372036854775807,
        cache: 1
      }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    uid: uuid().defaultRandom(),
    id: text()
  },
  table => [
    foreignKey({
      columns: [table.uid],
      foreignColumns: [users.id],
      name: 'user_uid_fkey'
    })
  ]
)

export const financeLog = pgTable(
  'finance_log',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    pk: bigint({ mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: 'finance_pk_seq',
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 9223372036854775807,
        cache: 1
      }),
    uid: uuid().defaultRandom().notNull(),
    type: varchar().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amount: bigint({ mode: 'number' }).default(sql`'0'`),
    category: varchar(),
    note: text(),
    paymentMethod: varchar('payment_method'),
    date: timestamp({ withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    financeAccountPk: bigint('finance_account_pk', { mode: 'number' })
  },
  table => [
    foreignKey({
      columns: [table.financeAccountPk],
      foreignColumns: [financeAccount.pk],
      name: 'finance_log_finance_account_pk_fkey'
    }),
    foreignKey({
      columns: [table.uid],
      foreignColumns: [users.id],
      name: 'finance_uid_fkey'
    })
  ]
)

export const comment = pgTable(
  'comment',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    pk: bigint({ mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: 'comment_pk_seq',
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 9223372036854775807,
        cache: 1
      }),
    uid: uuid().defaultRandom(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    diaryPk: bigint('diary_pk', { mode: 'number' }),
    content: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull()
  },
  table => [
    foreignKey({
      columns: [table.diaryPk],
      foreignColumns: [diary.pk],
      name: 'comment_diary_pk_fkey'
    }),
    foreignKey({
      columns: [table.uid],
      foreignColumns: [users.id],
      name: 'comment_uid_fkey'
    })
  ]
)

export const financeAccount = pgTable(
  'finance_account',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    pk: bigint({ mode: 'number' })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: 'finance_account_pk_seq',
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 9223372036854775807,
        cache: 1
      }),
    title: varchar().notNull(),
    category: varchar().notNull(),
    term: varchar().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amount: bigint({ mode: 'number' }).notNull(),
    note: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    uid: uuid().defaultRandom()
  },
  table => [
    foreignKey({
      columns: [table.uid],
      foreignColumns: [users.id],
      name: 'finance_account_uid_fkey'
    })
  ]
)
