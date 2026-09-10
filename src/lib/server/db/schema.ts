import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

/* ---------------------------------------------------------------- enums --- */

export const moderationMode = pgEnum('moderation_mode', ['instant', 'review']);
export const bookStatus = pgEnum('book_status', ['open', 'closed', 'archived']);
export const accessRole = pgEnum('access_role', ['admin', 'read']);
export const inviteKind = pgEnum('invite_kind', ['open', 'personal']);
export const questionFieldType = pgEnum('question_field_type', ['short', 'long', 'date']);
export const questionSection = pgEnum('question_section', ['left', 'right']);
export const entryState = pgEnum('entry_state', ['draft', 'submitted', 'published', 'hidden']);
export const editScope = pgEnum('edit_scope', ['personal', 'link']);
export const assetKind = pgEnum('asset_kind', ['avatar', 'drawing', 'photo']);

/* --------------------------------------------------------------- helpers --- */

const createdAt = timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

/* ----------------------------------------------------------------- book --- */

export const book = pgTable('book', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	subtitle: text('subtitle'),
	introText: text('intro_text'),
	/** { cover, paper, ornaments, ... } – siehe Admin-Design-Optionen */
	design: jsonb('design')
		.notNull()
		.default(sql`'{}'::jsonb`),
	moderationMode: moderationMode('moderation_mode').notNull().default('instant'),
	status: bookStatus('status').notNull().default('open'),
	/** offener /schreiben-Link aktiv? Personalisierte Einladungen bleiben davon unberührt */
	openWriteEnabled: boolean('open_write_enabled').notNull().default(true),
	recoveryEmail: text('recovery_email'),
	createdAt,
	updatedAt
});

/** Basis-Links des Buchs: genau eine Zeile je Rolle (admin, read). */
export const bookAccess = pgTable(
	'book_access',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		bookId: uuid('book_id')
			.notNull()
			.references(() => book.id, { onDelete: 'cascade' }),
		role: accessRole('role').notNull(),
		tokenHash: text('token_hash').notNull(),
		passwordHash: text('password_hash'),
		createdAt
	},
	(t) => [
		uniqueIndex('book_access_token_hash_key').on(t.tokenHash),
		uniqueIndex('book_access_book_role_key').on(t.bookId, t.role)
	]
);

/** Einladungslinks zum Eintragen: ein offener Link und/oder benannte Einzel-Einladungen. */
export const invite = pgTable(
	'invite',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		bookId: uuid('book_id')
			.notNull()
			.references(() => book.id, { onDelete: 'cascade' }),
		label: text('label'),
		kind: inviteKind('kind').notNull(),
		tokenHash: text('token_hash').notNull(),
		passwordHash: text('password_hash'),
		prefillName: text('prefill_name'),
		/** null = unbegrenzt (offener Link); Default 1 bei personal */
		maxEntries: integer('max_entries'),
		usedCount: integer('used_count').notNull().default(0),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		createdAt
	},
	(t) => [uniqueIndex('invite_token_hash_key').on(t.tokenHash)]
);

/* ------------------------------------------------------------- questions --- */

export const question = pgTable('question', {
	id: uuid('id').primaryKey().defaultRandom(),
	bookId: uuid('book_id')
		.notNull()
		.references(() => book.id, { onDelete: 'cascade' }),
	position: integer('position').notNull(),
	label: text('label').notNull(),
	fieldType: questionFieldType('field_type').notNull().default('short'),
	required: boolean('required').notNull().default(false),
	section: questionSection('section').notNull().default('left')
});

/* ---------------------------------------------------------------- entry --- */

export const entry = pgTable(
	'entry',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		bookId: uuid('book_id')
			.notNull()
			.references(() => book.id, { onDelete: 'cascade' }),
		inviteId: uuid('invite_id').references(() => invite.id, { onDelete: 'set null' }),
		displayName: text('display_name').notNull().default(''),
		position: integer('position').notNull().default(0),
		state: entryState('state').notNull().default('draft'),
		editTokenHash: text('edit_token_hash').notNull(),
		editScope: editScope('edit_scope').notNull().default('link'),
		/** verweisen auf asset.id; keine DB-FK, um Zyklus mit asset.entry_id zu vermeiden */
		avatarAssetId: uuid('avatar_asset_id'),
		drawingAssetId: uuid('drawing_asset_id'),
		closingLine: text('closing_line'),
		createdAt,
		updatedAt,
		publishedAt: timestamp('published_at', { withTimezone: true })
	},
	(t) => [uniqueIndex('entry_edit_token_hash_key').on(t.editTokenHash)]
);

export const entryAnswer = pgTable(
	'entry_answer',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		entryId: uuid('entry_id')
			.notNull()
			.references(() => entry.id, { onDelete: 'cascade' }),
		questionId: uuid('question_id')
			.notNull()
			.references(() => question.id, { onDelete: 'cascade' }),
		valueText: text('value_text').notNull().default('')
	},
	(t) => [uniqueIndex('entry_answer_entry_question_key').on(t.entryId, t.questionId)]
);

/* ---------------------------------------------------------------- asset --- */

export const asset = pgTable('asset', {
	id: uuid('id').primaryKey().defaultRandom(),
	bookId: uuid('book_id')
		.notNull()
		.references(() => book.id, { onDelete: 'cascade' }),
	entryId: uuid('entry_id').references(() => entry.id, { onDelete: 'cascade' }),
	kind: assetKind('kind').notNull(),
	path: text('path').notNull(),
	thumbPath: text('thumb_path'),
	width: integer('width'),
	height: integer('height'),
	altText: text('alt_text'),
	/** { rotation, offsetX, offsetY } für Polaroid-Platzierung */
	position: jsonb('position'),
	createdAt
});

/* ------------------------------------------------------------ recovery --- */

export const recoveryRequest = pgTable(
	'recovery_request',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		bookId: uuid('book_id')
			.notNull()
			.references(() => book.id, { onDelete: 'cascade' }),
		tokenHash: text('token_hash').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt
	},
	(t) => [uniqueIndex('recovery_request_token_hash_key').on(t.tokenHash)]
);

export const auditLog = pgTable('audit_log', {
	id: uuid('id').primaryKey().defaultRandom(),
	bookId: uuid('book_id').references(() => book.id, { onDelete: 'cascade' }),
	actorRole: text('actor_role'),
	action: text('action').notNull(),
	meta: jsonb('meta'),
	createdAt
});

/* ------------------------------------------------------------ relations --- */

export const bookRelations = relations(book, ({ many }) => ({
	access: many(bookAccess),
	invites: many(invite),
	questions: many(question),
	entries: many(entry),
	assets: many(asset)
}));

export const bookAccessRelations = relations(bookAccess, ({ one }) => ({
	book: one(book, { fields: [bookAccess.bookId], references: [book.id] })
}));

export const inviteRelations = relations(invite, ({ one, many }) => ({
	book: one(book, { fields: [invite.bookId], references: [book.id] }),
	entries: many(entry)
}));

export const questionRelations = relations(question, ({ one, many }) => ({
	book: one(book, { fields: [question.bookId], references: [book.id] }),
	answers: many(entryAnswer)
}));

export const entryRelations = relations(entry, ({ one, many }) => ({
	book: one(book, { fields: [entry.bookId], references: [book.id] }),
	invite: one(invite, { fields: [entry.inviteId], references: [invite.id] }),
	answers: many(entryAnswer),
	assets: many(asset)
}));

export const entryAnswerRelations = relations(entryAnswer, ({ one }) => ({
	entry: one(entry, { fields: [entryAnswer.entryId], references: [entry.id] }),
	question: one(question, { fields: [entryAnswer.questionId], references: [question.id] })
}));

export const assetRelations = relations(asset, ({ one }) => ({
	book: one(book, { fields: [asset.bookId], references: [book.id] }),
	entry: one(entry, { fields: [asset.entryId], references: [entry.id] })
}));

/* ---------------------------------------------------------------- types --- */

export type Book = typeof book.$inferSelect;
export type NewBook = typeof book.$inferInsert;
export type BookAccess = typeof bookAccess.$inferSelect;
export type Invite = typeof invite.$inferSelect;
export type Question = typeof question.$inferSelect;
export type Entry = typeof entry.$inferSelect;
export type EntryAnswer = typeof entryAnswer.$inferSelect;
export type Asset = typeof asset.$inferSelect;
