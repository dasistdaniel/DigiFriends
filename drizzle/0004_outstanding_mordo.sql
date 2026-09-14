ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_book_id_book_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE set null ON UPDATE no action;