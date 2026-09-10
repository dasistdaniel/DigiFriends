CREATE TYPE "public"."access_role" AS ENUM('admin', 'read');--> statement-breakpoint
CREATE TYPE "public"."asset_kind" AS ENUM('avatar', 'drawing', 'photo');--> statement-breakpoint
CREATE TYPE "public"."book_status" AS ENUM('open', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."edit_scope" AS ENUM('personal', 'link');--> statement-breakpoint
CREATE TYPE "public"."entry_state" AS ENUM('draft', 'submitted', 'published', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."invite_kind" AS ENUM('open', 'personal');--> statement-breakpoint
CREATE TYPE "public"."moderation_mode" AS ENUM('instant', 'review');--> statement-breakpoint
CREATE TYPE "public"."question_field_type" AS ENUM('short', 'long', 'date');--> statement-breakpoint
CREATE TYPE "public"."question_section" AS ENUM('left', 'right');--> statement-breakpoint
CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"entry_id" uuid,
	"kind" "asset_kind" NOT NULL,
	"path" text NOT NULL,
	"thumb_path" text,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"position" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid,
	"actor_role" text,
	"action" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"intro_text" text,
	"design" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"moderation_mode" "moderation_mode" DEFAULT 'instant' NOT NULL,
	"status" "book_status" DEFAULT 'open' NOT NULL,
	"open_write_enabled" boolean DEFAULT true NOT NULL,
	"recovery_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"role" "access_role" NOT NULL,
	"token_hash" text NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"invite_id" uuid,
	"display_name" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"state" "entry_state" DEFAULT 'draft' NOT NULL,
	"edit_token_hash" text NOT NULL,
	"edit_scope" "edit_scope" DEFAULT 'link' NOT NULL,
	"avatar_asset_id" uuid,
	"drawing_asset_id" uuid,
	"closing_line" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "entry_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"value_text" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"label" text,
	"kind" "invite_kind" NOT NULL,
	"token_hash" text NOT NULL,
	"password_hash" text,
	"prefill_name" text,
	"max_entries" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"label" text NOT NULL,
	"field_type" "question_field_type" DEFAULT 'short' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"section" "question_section" DEFAULT 'left' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_entry_id_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_access" ADD CONSTRAINT "book_access_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_invite_id_invite_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invite"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_answer" ADD CONSTRAINT "entry_answer_entry_id_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_answer" ADD CONSTRAINT "entry_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_request" ADD CONSTRAINT "recovery_request_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "book_access_token_hash_key" ON "book_access" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "book_access_book_role_key" ON "book_access" USING btree ("book_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "entry_edit_token_hash_key" ON "entry" USING btree ("edit_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "entry_answer_entry_question_key" ON "entry_answer" USING btree ("entry_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invite_token_hash_key" ON "invite" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "recovery_request_token_hash_key" ON "recovery_request" USING btree ("token_hash");