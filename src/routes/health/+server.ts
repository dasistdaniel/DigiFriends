import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

/** Liveness- + DB-Check für Docker/Reverse-Proxy. */
export async function GET() {
	try {
		await db.execute(sql`select 1`);
		return json({ ok: true, db: 'up' });
	} catch (err) {
		return json({ ok: false, db: 'down', error: String(err) }, { status: 503 });
	}
}
