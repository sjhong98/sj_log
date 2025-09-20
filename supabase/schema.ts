// @ts-nocheck
import { pgTable, foreignKey, bigint, varchar, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const name = pgTable("name", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "name_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: varchar(),
	subname: varchar(),
	description: text(),
	secretDescription: text("secret_description"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	importanceLevel: bigint("importance_level", { mode: "number" }),
	images: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	uid: uuid().defaultRandom(),
}, (table) => [
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "name_uid_fkey"
		}),
]);

export const nameTag = pgTable("name_tag", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "name_tag_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	uid: uuid().defaultRandom(),
}, (table) => [
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "name_tag_uid_fkey"
		}),
]);

export const financeLog = pgTable("finance_log", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "finance_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	uid: uuid().defaultRandom().notNull(),
	type: varchar().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).default(sql`'0'`),
	category: varchar(),
	note: text(),
	paymentMethod: varchar("payment_method"),
	date: timestamp({ withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	financeAccountPk: bigint("finance_account_pk", { mode: "number" }),
	title: varchar().default(' '),
}, (table) => [
	foreignKey({
			columns: [table.financeAccountPk],
			foreignColumns: [financeAccount.pk],
			name: "finance_log_finance_account_pk_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "finance_uid_fkey"
		}),
]);

export const comment = pgTable("comment", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "comment_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	uid: uuid().defaultRandom(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	diaryPk: bigint("diary_pk", { mode: "number" }),
	content: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.diaryPk],
			foreignColumns: [diary.pk],
			name: "comment_diary_pk_fkey"
		}),
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "comment_uid_fkey"
		}),
]);

export const diary = pgTable("diary", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "diary_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	content: text(),
	date: timestamp({ mode: 'string' }),
	uid: uuid().defaultRandom(),
	title: varchar(),
	contentText: text(),
	thumbnail: text(),
});

export const financeAccount = pgTable("finance_account", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "finance_account_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	title: varchar().notNull(),
	category: varchar().notNull(),
	term: varchar().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).notNull(),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	uid: uuid().defaultRandom(),
}, (table) => [
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "finance_account_uid_fkey"
		}),
]);

export const user = pgTable("user", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	uid: uuid().defaultRandom(),
	id: text(),
}, (table) => [
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "user_uid_fkey"
		}),
]);

export const devLog = pgTable("dev_log", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "dev_log_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	title: varchar().notNull(),
	content: text().notNull(),
	date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	uid: uuid().defaultRandom().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	groupPk: bigint("group_pk", { mode: "number" }).notNull(),
	text: text(),
}, (table) => [
	foreignKey({
			columns: [table.groupPk],
			foreignColumns: [devLogGroup.pk],
			name: "dev_log_group_pk_fkey"
		}),
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "dev_log_uid_fkey"
		}),
]);

export const devLogTagRelation = pgTable("dev_log_tag_relation", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "dev_log_tag_relation_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	devLogPk: bigint("dev_log_pk", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	devLogTagPk: bigint("dev_log_tag_pk", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.devLogPk],
			foreignColumns: [devLog.pk],
			name: "dev_log_tag_relation_dev_log_pk_fkey"
		}).onUpdate("cascade"),
	foreignKey({
			columns: [table.devLogTagPk],
			foreignColumns: [devLogTag.pk],
			name: "dev_log_tag_relation_dev_log_tag_pk_fkey"
		}),
]);

export const devLogTag = pgTable("dev_log_tag", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "dev_log_tag_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: varchar().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const devLogGroup = pgTable("dev_log_group", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "dev_log_group_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parentGroupPk: bigint("parent_group_pk", { mode: "number" }),
	name: varchar().notNull(),
	uid: uuid().defaultRandom().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "dev_log_group_uid_fkey"
		}),
]);

export const nameTagRelation = pgTable("name_tag_relation", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pk: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "name_tag_relation_pk_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	namePk: bigint("name_pk", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tagPk: bigint("tag_pk", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.namePk],
			foreignColumns: [name.pk],
			name: "name_tag_relation_name_pk_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.tagPk],
			foreignColumns: [nameTag.pk],
			name: "name_tag_relation_tag_pk_fkey"
		}).onDelete("set null"),
]);
