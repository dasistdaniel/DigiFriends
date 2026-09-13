// Dünner Wrapper um den adapter-node-Handler: static/-Dateien (Fonts, Bilder)
// bekommen anders als /_app/immutable/ standardmäßig keinen Cache-Control-Header
// (nur ETag-Revalidierung). Ohne Reverse-Proxy vor dem Node-Prozess ist dies
// die einzige Stelle, an der wir das nachrüsten können.
import { createServer } from 'node:http';
import { handler } from './build/handler.js';

const CACHE_RULES = [
	{ prefix: '/fonts/', value: 'public, max-age=2592000' },
	{ prefix: '/images/', value: 'public, max-age=2592000' }
];

const server = createServer((req, res) => {
	const pathname = req.url.split('?')[0];
	const rule = CACHE_RULES.find((r) => pathname.startsWith(r.prefix));
	if (rule) res.setHeader('cache-control', rule.value);
	handler(req, res);
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
	console.log(`Listening on ${host}:${port}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
	process.on(signal, () => server.close(() => process.exit(0)));
}
