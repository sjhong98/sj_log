// @ts-nocheck
import { relations } from "drizzle-orm/relations";
import { usersInAuth, name, nameTag, financeAccount, financeLog, diary, comment, user, devLogGroup, devLog, devLogTagRelation, devLogTag, nameTagRelation } from "./schema";

export const nameRelations = relations(name, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [name.uid],
		references: [usersInAuth.id]
	}),
	nameTagRelations: many(nameTagRelation),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	names: many(name),
	nameTags: many(nameTag),
	financeLogs: many(financeLog),
	comments: many(comment),
	financeAccounts: many(financeAccount),
	users: many(user),
	devLogs: many(devLog),
	devLogGroups: many(devLogGroup),
}));

export const nameTagRelations = relations(nameTag, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [nameTag.uid],
		references: [usersInAuth.id]
	}),
	nameTagRelations: many(nameTagRelation),
}));

export const financeLogRelations = relations(financeLog, ({one}) => ({
	financeAccount: one(financeAccount, {
		fields: [financeLog.financeAccountPk],
		references: [financeAccount.pk]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [financeLog.uid],
		references: [usersInAuth.id]
	}),
}));

export const financeAccountRelations = relations(financeAccount, ({one, many}) => ({
	financeLogs: many(financeLog),
	usersInAuth: one(usersInAuth, {
		fields: [financeAccount.uid],
		references: [usersInAuth.id]
	}),
}));

export const commentRelations = relations(comment, ({one}) => ({
	diary: one(diary, {
		fields: [comment.diaryPk],
		references: [diary.pk]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [comment.uid],
		references: [usersInAuth.id]
	}),
}));

export const diaryRelations = relations(diary, ({many}) => ({
	comments: many(comment),
}));

export const userRelations = relations(user, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [user.uid],
		references: [usersInAuth.id]
	}),
}));

export const devLogRelations = relations(devLog, ({one, many}) => ({
	devLogGroup: one(devLogGroup, {
		fields: [devLog.groupPk],
		references: [devLogGroup.pk]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [devLog.uid],
		references: [usersInAuth.id]
	}),
	devLogTagRelations: many(devLogTagRelation),
}));

export const devLogGroupRelations = relations(devLogGroup, ({one, many}) => ({
	devLogs: many(devLog),
	usersInAuth: one(usersInAuth, {
		fields: [devLogGroup.uid],
		references: [usersInAuth.id]
	}),
}));

export const devLogTagRelationRelations = relations(devLogTagRelation, ({one}) => ({
	devLog: one(devLog, {
		fields: [devLogTagRelation.devLogPk],
		references: [devLog.pk]
	}),
	devLogTag: one(devLogTag, {
		fields: [devLogTagRelation.devLogTagPk],
		references: [devLogTag.pk]
	}),
}));

export const devLogTagRelations = relations(devLogTag, ({many}) => ({
	devLogTagRelations: many(devLogTagRelation),
}));

export const nameTagRelationRelations = relations(nameTagRelation, ({one}) => ({
	name: one(name, {
		fields: [nameTagRelation.namePk],
		references: [name.pk]
	}),
	nameTag: one(nameTag, {
		fields: [nameTagRelation.tagPk],
		references: [nameTag.pk]
	}),
}));