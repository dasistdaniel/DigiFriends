# DigiFriends

Digitales Freundebuch als Web-App: ein Buch, das sich im Browser aufschlagen und
durchblättern lässt. Ohne Konto, teilbar per Link, selbst betreibbar per Docker auf
einem VPS.

- Konzept: [`KONZEPT.md`](./KONZEPT.md)
- Ausgangsidee: [`idee.md`](./idee.md)
- Stilreferenz: `Screenshot 2026-09-10 194259.png` (KI-generiertes Mockup, nur Beispiel)

> Projektname „DigiFriends" ist noch nicht final.

## Status

Buch anlegen, Lesen/Schreiben mit Foto-Upload, Eintrag bearbeiten, Admin-Oberfläche
(Einträge/Fragen/Buch/Zugänge) und Deployment stehen. Offene Punkte: Zeichen-Canvas,
Design-Optionen, E-Mail-Recovery, Export, DSGVO-Seiten – siehe `KONZEPT.md` (§14/§15).

## Stack

SvelteKit (Svelte 5) · TypeScript · `@sveltejs/adapter-node` · Drizzle ORM ·
PostgreSQL (Produktion) / PGlite (lokal, ohne Installation) · `sharp` · Docker Compose
(Reverse Proxy/TLS stellt der Betreiber bereit)

## Entwicklung

```sh
npm install
cp .env.example .env      # Standardwerte laufen lokal ohne Anpassung
npm run db:push           # Schema in die lokale DB schreiben
npm run dev
```

Weitere Skripte: `npm run check`, `npm run lint`, `npm run format`, `npm test`.

## Deployment

Siehe [`DEPLOYMENT.md`](./DEPLOYMENT.md) – `docker compose up -d --build` auf einem
eigenen Server, TLS/Domain per Reverse Proxy davor.
