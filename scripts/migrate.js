// Wird beim Container-Start vor dem eigentlichen Server ausgeführt.
// Wendet ausstehende Drizzle-Migrationen auf eine echte PostgreSQL-DB an.
// Bei PGlite (lokale Entwicklung) wird das Skript übersprungen -- dort
// erledigt `npm run db:push`/`db:migrate` das manuell.
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const url = process.env.DATABASE_URL?.trim();

if (!url || !(url.startsWith('postgres://') || url.startsWith('postgresql://'))) {
	console.log('[migrate] Keine PostgreSQL-DATABASE_URL gesetzt, überspringe Migration.');
	process.exit(0);
}

const sql = postgres(url, { max: 1 });
try {
	await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
	console.log('[migrate] Migrationen angewendet.');
} finally {
	await sql.end();
}
