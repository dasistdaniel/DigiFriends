# Deployment

Läuft als zwei Docker-Container (App + PostgreSQL) über `docker compose`.
Der App-Container ist unter einem festen Host-Port erreichbar; TLS und die
öffentliche Domain übernimmt ein Reverse Proxy davor (Caddy/nginx/Traefik –
außerhalb dieses Repos).

## Voraussetzungen auf dem Server

- Docker + Docker Compose (`docker compose version`)
- Ein Nutzer, der in der `docker`-Gruppe ist (kein root/sudo für `docker`-Befehle nötig)

## Erstes Deployment

```sh
# 1. Projektverzeichnis anlegen und Code übertragen (vom lokalen Repo aus):
ssh user@server "mkdir -p /pfad/zu/DigiFriends"
git archive HEAD | ssh user@server "tar -x -C /pfad/zu/DigiFriends"

# 2. Auf dem Server: Produktions-Konfiguration anlegen
ssh user@server
cd /pfad/zu/DigiFriends
cp docker-compose.env.example .env
# .env öffnen und ORIGIN, APP_PORT, SECRET_PEPPER, POSTGRES_PASSWORD setzen
#   openssl rand -base64 32   # für SECRET_PEPPER
#   openssl rand -base64 24   # für POSTGRES_PASSWORD

# 3. Bauen und starten
docker compose up -d --build

# 4. Prüfen
docker compose ps
curl -s http://localhost:$APP_PORT/health   # {"ok":true,"db":"up"}
docker compose logs -f app
```

Die Datenbank-Migrationen laufen automatisch bei jedem Start des App-Containers
(`scripts/migrate.js`, idempotent – bereits angewendete Migrationen werden
übersprungen).

## Updates einspielen

```sh
git archive HEAD | ssh user@server "tar -x -C /pfad/zu/DigiFriends"
ssh user@server "cd /pfad/zu/DigiFriends && docker compose up -d --build"
```

`git archive` überträgt nur committete Dateien – `.env`, Uploads und die
Postgres-Daten (beides in benannten Docker-Volumes) bleiben unberührt.

## Reverse Proxy

Der App-Container hört intern auf Port 3000, nach außen auf `APP_PORT`
(Standard `7066`). Der Reverse Proxy muss auf `http://<server>:${APP_PORT}`
weiterleiten und TLS für die Domain aus `ORIGIN` terminieren. `ORIGIN` muss
exakt der öffentlichen URL entsprechen (inkl. `https://`, ohne Slash am Ende) –
SvelteKit nutzt das, um Formular- und Cookie-Herkunft korrekt zu bestimmen,
auch wenn der Proxy keine `X-Forwarded-*`-Header setzt.

## Backups

- **Datenbank:** `docker compose exec db pg_dump -U digifriends digifriends | gzip > backup-$(date +%F).sql.gz`
- **Uploads:** Volume `uploads` sichern, z. B. `docker run --rm -v digifriends_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .`

Beides regelmäßig per Cron außerhalb des Servers ablegen.

## Wichtige Umgebungsvariablen

Siehe [`docker-compose.env.example`](./docker-compose.env.example) für die
vollständige Liste. Ohne gesetzte `SECRET_PEPPER` würden nach einem Neustart
mit anderem Pepper alle bestehenden Buch-Links ungültig – unbedingt fest
setzen und sichern.
