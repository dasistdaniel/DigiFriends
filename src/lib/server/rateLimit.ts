type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Vereinzelte Leichen (IPs, die nie wiederkommen) regelmäßig wegräumen,
// damit die Map nicht unbegrenzt wächst. Ein Prozess reicht hier völlig -
// die App läuft nicht mehrfach parallel (kein externer Store nötig).
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const cleanupTimer = setInterval(() => {
	const now = Date.now();
	for (const [key, b] of buckets) {
		if (b.resetAt < now) buckets.delete(key);
	}
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

/**
 * Einfaches Fixed-Window-Limit pro Schlüssel (z. B. "ip:bookId"). Zählt
 * jeden Aufruf (auch fehlgeschlagene), damit auch reines Durchprobieren
 * gebremst wird. Gibt true zurück, wenn die Aktion noch erlaubt ist.
 */
export function rateLimit(key: string, opts: { limit: number; windowMs: number }): boolean {
	const now = Date.now();
	const existing = buckets.get(key);
	if (!existing || existing.resetAt < now) {
		buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
		return true;
	}
	if (existing.count >= opts.limit) return false;
	existing.count++;
	return true;
}
