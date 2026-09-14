import { cleanupOrphanedAssets } from '$lib/server/cleanup';

// adapter-node hält den Serverprozess dauerhaft am Leben (kein Serverless-
// Neustart pro Request) – ideal für einen simplen In-Process-Cron ohne
// zusätzlichen Container/Dienst. Läuft einmal pro Prozessstart hier an,
// nicht pro Request.
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;
const CLEANUP_STARTUP_DELAY_MS = 60 * 1000;

function scheduleCleanup() {
	cleanupOrphanedAssets()
		.catch((err) => console.error('[cleanup] fehlgeschlagen:', err))
		.finally(() => setTimeout(scheduleCleanup, CLEANUP_INTERVAL_MS));
}

setTimeout(scheduleCleanup, CLEANUP_STARTUP_DELAY_MS);
