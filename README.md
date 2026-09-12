# DigiFriends

Digitales Freundebuch als Web-App: ein Buch, das sich im Browser aufschlagen und
durchblättern lässt. Ohne Konto, teilbar per Link, selbst betreibbar per Docker auf
einem VPS.

- Online: [digifriends.nichtregistriert.de](http://digifriends.nichtregistriert.de)
- Konzept: [`KONZEPT.md`](./KONZEPT.md)
- Ausgangsidee: [`idee.md`](./idee.md)

> Projektname „DigiFriends" ist noch nicht final.

## Status

Buch anlegen (inkl. Einband-Design), Lesen/Schreiben mit Foto-Upload, Eintrag
bearbeiten, Admin-Oberfläche (Einträge/Fragen/Buch/Zugänge), Betreiber-Bereich
(Bücher einsehen/sperren, Statistik), Impressum/Datenschutz und Deployment stehen.
Offene Punkte: Zeichen-Canvas, E-Mail-Recovery, Export – siehe `KONZEPT.md` (§14/§15).

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

## Lizenz & Bildnachweis

Code steht unter der [MIT-Lizenz](./LICENSE). Die Schriften (Oswald, Crimson Pro,
Kalam, selbst gehostet unter `static/fonts/`) sind Google Fonts unter der
[SIL Open Font License](https://openfontlicense.org/). Der Holz-Hintergrund
(`static/images/desk-oak.webp`) ist ein Foto von Simon Berger auf
[Unsplash](https://unsplash.com/de/fotos/JH_R66BihvA), genutzt unter der
[Unsplash-Lizenz](https://unsplash.com/de/lizenz).
