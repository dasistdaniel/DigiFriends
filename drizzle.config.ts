import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL?.trim() || 'pglite://.pgdata';
const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	// PGlite lokal, echtes Postgres in Produktion – gleiche Migrationen.
	...(isPostgres
		? { dbCredentials: { url } }
		: { driver: 'pglite', dbCredentials: { url: url.replace(/^pglite:\/\//, '') || '.pgdata' } }),
	verbose: true,
	strict: true
});
