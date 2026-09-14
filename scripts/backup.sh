#!/bin/sh
# Laeuft dauerhaft in einem eigenen Container (siehe docker-compose.yml,
# Service "backup"): einmal taeglich Datenbank + Uploads sichern, alte
# Sicherungen nach BACKUP_KEEP_DAYS loeschen. Bewusst kein externer
# Cron-Daemon - eine simple Endlosschleife mit `sleep` reicht fuer diesen
# einen Zweck und braucht kein zusaetzliches Paket im Alpine-Image.
set -eu

KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
OUT_DIR="/backups"

mkdir -p "$OUT_DIR"

echo "[backup] Start. Aufbewahrung: ${KEEP_DAYS} Tage."

while true; do
	ts="$(date +%Y%m%d-%H%M%S)"
	echo "[backup] ${ts}: sichere Datenbank..."
	if pg_dump | gzip > "${OUT_DIR}/db-${ts}.sql.gz.tmp"; then
		mv "${OUT_DIR}/db-${ts}.sql.gz.tmp" "${OUT_DIR}/db-${ts}.sql.gz"
	else
		echo "[backup] ${ts}: Datenbank-Sicherung fehlgeschlagen." >&2
		rm -f "${OUT_DIR}/db-${ts}.sql.gz.tmp"
	fi

	echo "[backup] ${ts}: sichere Uploads..."
	if tar czf "${OUT_DIR}/uploads-${ts}.tar.gz.tmp" -C /data/uploads .; then
		mv "${OUT_DIR}/uploads-${ts}.tar.gz.tmp" "${OUT_DIR}/uploads-${ts}.tar.gz"
	else
		echo "[backup] ${ts}: Uploads-Sicherung fehlgeschlagen." >&2
		rm -f "${OUT_DIR}/uploads-${ts}.tar.gz.tmp"
	fi

	find "$OUT_DIR" -name 'db-*.sql.gz' -mtime "+${KEEP_DAYS}" -delete
	find "$OUT_DIR" -name 'uploads-*.tar.gz' -mtime "+${KEEP_DAYS}" -delete

	echo "[backup] ${ts}: fertig, naechster Lauf in 24h."
	sleep 86400
done
