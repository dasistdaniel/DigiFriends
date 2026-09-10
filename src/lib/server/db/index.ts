import { env } from '$env/dynamic/private';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * Datenbank-Anbindung mit zwei Backends aus einer `DATABASE_URL`:
 *
 * - `postgres://` / `postgresql://` → echtes PostgreSQL (Produktion, VPS)
 * - alles andere (z. B. `pglite://.pgdata` oder ein Pfad) → eingebettetes
 *   PGlite, damit lokal ohne DB-Installation entwickelt werden kann.
 *
 * Das Drizzle-Schema und der SQL-Dialekt sind für beide identisch.
 */

const url = env.DATABASE_URL?.trim() || 'pglite://.pgdata';
const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://');

// Beide Treiber liefern kompatible Query-APIs; nach aussen als ein Typ.
export type DB = PostgresJsDatabase<typeof schema>;

async function createDb(): Promise<DB> {
	if (isPostgres) {
		const [{ drizzle }, { default: postgres }] = await Promise.all([
			import('drizzle-orm/postgres-js'),
			import('postgres')
		]);
		return drizzle(postgres(url), { schema });
	}

	const [{ drizzle }, { PGlite }] = await Promise.all([
		import('drizzle-orm/pglite'),
		import('@electric-sql/pglite')
	]);
	const dataDir = url.replace(/^pglite:\/\//, '') || '.pgdata';
	const client = new PGlite(dataDir);
	return drizzle(client, { schema }) as unknown as DB;
}

export const db = await createDb();
export { schema };
