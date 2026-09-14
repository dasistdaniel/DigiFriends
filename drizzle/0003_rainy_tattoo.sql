ALTER TABLE "book" ADD COLUMN "question_pick_left" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "question_pick_right" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
-- Bestehende Buecher: Pick-Anzahl auf die tatsaechlich vorhandene Fragenzahl je Seite setzen,
-- damit sich fuer sie nichts aendert (weiterhin alle dieselben Fragen vorgelegt bekommen).
UPDATE "book" b SET "question_pick_left" = sub.cnt
FROM (SELECT book_id, COUNT(*) AS cnt FROM "question" WHERE section = 'left' GROUP BY book_id) sub
WHERE sub.book_id = b.id;--> statement-breakpoint
UPDATE "book" b SET "question_pick_right" = sub.cnt
FROM (SELECT book_id, COUNT(*) AS cnt FROM "question" WHERE section = 'right' GROUP BY book_id) sub
WHERE sub.book_id = b.id;