# Digitales Freundebuch – Konzept

**v0.3 · 10.09.2026**
Basis: `idee.md` + KI-Mockup „Digitales Freundebuch für Erwachsene" (nur Stilbeispiel)
Interaktive Fassung: <https://claude.ai/code/artifact/1c002c5c-c5b8-43e4-84c6-6d34411e2934>

---

## 01 · Idee in einem Satz

Eine Web-App, mit der jemand ein **digitales Freundebuch** anlegt und per Link mit
Freundinnen und Freunden teilt. Wer den Link öffnet, sieht ein geschlossenes Buch,
schlägt es auf und blättert durch die Einträge. Wer sich einträgt, füllt eine
Doppelseite aus, die im Layout exakt der Leseansicht entspricht – nur mit
Eingabefeldern statt Text, plus Avatar, kleiner Zeichnung und Polaroid-Fotos.

Kein Login, keine Registrierung. Ein Buch = drei Links (Verwalten / Eintragen /
Ansehen), jeweils optional mit Passwort. Läuft als Docker-Setup auf einem eigenen VPS.

## 02 · Leitprinzipien

- **Haptik zuerst** – Papier-Textur, Buchbindung, Seitenschatten, dezentes
  Blätter-Geräusch. Das Buch ist die Metapher und die gesamte Navigation.
- **Ohne Hürde** – keine Anmeldung, keine App. Link öffnen genügt. Passwörter
  optional und pro Link einzeln.
- **Datensparsam** – nur E-Mail (optional, für Wiederherstellung). Hosting in der EU,
  klares Löschkonzept, Bild-Uploads mit Einwilligung.
- **Selbst betreibbar** – ein `docker compose up` auf einem kleinen VPS, keine
  Abhängigkeit von proprietären Cloud-Diensten.

## 03 · Rollen & Links

Beim Anlegen eines Buchs werden nicht erratbare Links erzeugt (je ein langes
Zufalls-Token). Jeder Link kann zusätzlich mit einem eigenen Passwort geschützt werden.

| Link | Darf | Darf nicht |
|---|---|---|
| **Admin** `/b/<token>/admin` | Buch konfigurieren, Fragen & Vorlage bearbeiten, Design wählen, Einträge moderieren / bearbeiten / löschen / sortieren, Links & Passwörter verwalten, Export, Buch archivieren/löschen | — |
| **Eintragen** `/b/<token>/schreiben` · `/e/<einladungs-token>` | Buch lesen (inkl. bereits veröffentlichter Einträge), einen Eintrag erstellen und ihn später über den eigenen Bearbeitungs-Link ändern | Einstellungen ändern, fremde Einträge bearbeiten, noch nicht freigegebene Einträge anderer sehen |
| **Ansehen** `/b/<token>/lesen` | Nur lesen & blättern, Zeichnungen/Fotos vergrößern | Eintragen, irgendetwas ändern |

### Einladungslinks zum Eintragen

Der Admin entscheidet pro Buch, wie eingetragen wird – beide Varianten sind kombinierbar:

- **Offener Link** – ein `/schreiben`-Link, den jede:r nutzen kann, um einen Eintrag
  hinzuzufügen (optional passwortgeschützt).
- **Personalisierte Einladungen** – der Admin legt benannte Links an (z. B. „für Anna").
  Jeder personalisierte Link erlaubt standardmäßig genau einen Eintrag, zeigt den Namen
  vorausgefüllt und lässt sich einzeln zurückziehen. So bekommt der Admin eine saubere
  Übersicht, wer schon dran war.

### Wiederherstellung (E-Mail optional)

Beim Anlegen kann eine E-Mail-Adresse hinterlegt werden. Geht der Admin-Link oder das
Passwort verloren, fordert man über die Startseite einen Wiederherstellungs-Link an:
E-Mail eingeben → zeitlich begrenzter Magic-Link (z. B. 30 Min gültig) → neuer
Admin-Link wird angezeigt / Passwort neu gesetzt. Ohne hinterlegte E-Mail ist ein
verlorener Admin-Link endgültig weg – das wird beim Anlegen deutlich kommuniziert.

## 04 · Das Buch – Leseansicht

### Zustände

1. **Geschlossen** – Cover von außen sichtbar (Titel, Bindung, Textur). Klick „Aufschlagen".
2. **Aufgeschlagen – Doppelseite 1/2** – links ein Begrüßungs-/Beschreibungstext (vom
   Admin gepflegt), rechts der Beginn des Inhaltsverzeichnisses mit Links zu den Einträgen.
3. **Inhaltsverzeichnis mehrseitig** – reicht Seite 2 nicht, läuft das Verzeichnis auf
   Seite 3, 4, … weiter, bevor die Einträge beginnen.
4. **Einträge** – jeder Eintrag belegt eine Doppelseite im Stil des Mockups (links
   Fragen A, rechts Fragen B + Foto-Bereich + Grußformel).

Wer selbst einen Eintrag schreibt, darf beim Blättern die bereits **veröffentlichten**
Einträge lesen. Verborgen bleiben nur Einträge in der Freigabe-Warteschlange.

### Entscheidung: Blättern

**Sanfter Seitenübergang.** Buch-Optik mit Bindung, Papierkante und Seitenschatten; der
Seitenwechsel läuft als kurze Slide-/Aufdeck-Animation (~350 ms) mit dezentem
Curl-Schatten und optionalem Papiergeräusch. Robust, performant, identisch auf Touch
(Wischen) und Desktop. Ein realistisches 3D-Blättern (Library `StPageFlip`) bleibt als
spätere, optionale Progressive Enhancement möglich, ohne das Datenmodell zu ändern.

### Navigation

- Inhaltsverzeichnis-Einträge sind anklickbare Sprünge zur jeweiligen Doppelseite.
- Blätter-Pfeile links/rechts, Tastatur (← →), Touch-Wisch.
- Dezenter Fortschritt (z. B. „Seite 6 von 24") und „Zurück zum Inhaltsverzeichnis".
- Optional: Lesezeichen-Band, das an die zuletzt gelesene Seite springt
  (`localStorage` pro Gerät).

### Responsive

Ab ~1024 px echte Doppelseite. Darunter eine Seite pro Ansicht (linke, dann rechte
Seite), Bindung am Rand angedeutet. Alle Interaktionen bleiben gleich.

## 05 · Eintrag erstellen

Die Schreibansicht ist dieselbe Doppelseite wie beim Lesen – nur mit Eingabefeldern an
den Stellen, wo sonst Text steht. Kein separates „Formular", damit das Buchgefühl
erhalten bleibt.

### Bausteine

- **Avatar-Foto** – Upload eines Porträtbilds, Zuschneiden im Kreis/Rahmen, oben auf
  der Seite platziert. Optional statt Foto: Initialen-Badge.
- **Mini-Zeichnung** – kleiner Zeichenbereich; Klick öffnet ein größeres Canvas (Stift,
  wenige Farben, Radierer, Undo). In der Seite klein skaliert, per Klick als Lightbox groß.
- **Polaroid-Fotos** – mehrere Foto-Uploads, als kleine Polaroids mit leichter Drehung
  auf der Seite verteilt. Klick → vergrößerte Ansicht (Lightbox, Weiterblättern zwischen
  den Fotos).
- **Textfelder** – pro Frage ein Feld (ein- oder mehrzeilig, vom Admin festgelegt).
  Zeichenlimit sichtbar, Auto-Speichern als Entwurf.

### Ablauf

1. Über den offenen Eintragen-Link oder eine personalisierte Einladung „Neuen Eintrag
   beginnen" (bei personalisierter Einladung ist der Name vorausgefüllt).
2. Felder ausfüllen, Bilder/Zeichnung hinzufügen. Entwurf wird lokal & serverseitig
   gespeichert.
3. „Eintrag abschließen". Je nach Buch-Einstellung sofort im Buch sichtbar oder erst
   nach Freigabe (siehe 07).
4. Nach dem Abschließen erhält die Person einen **persönlichen Bearbeitungs-Link**, mit
   dem sie den eigenen Eintrag später ändern oder löschen kann. Der Admin kann diesen
   Link personalisiert an eine Person binden oder als „für alle mit dem Link" freigeben.

### Technische Notiz Bild-Uploads

Bilder werden clientseitig verkleinert (max. Kantenlänge ~2000 px), als WebP/JPEG
gespeichert, EXIF entfernt. Server erzeugt zusätzlich Thumbnails. Limits pro Eintrag
konfigurierbar (Default: 1 Avatar, 1 Zeichnung, bis 6 Fotos, je ≤ 8 MB Upload).

## 06 · Fragen: Vorlagen & Editor

Beim Anlegen wählt der Admin eine **Vorlage**. Danach ist jede Frage **voll editierbar**:
umformulieren, löschen, neu sortieren, neue Fragen hinzufügen, Feldtyp wählen (einzeilig
/ mehrzeilig / Datum). Die Vorlage ist nur ein Startpunkt.

### Vorlage „Erwachsene / Freundschaft" (aus dem Mockup)

**Linke Seite**

- Eintrag von: \_\_
- Wie haben wir uns kennengelernt?
- Unser lustigster gemeinsamer Moment
- Wenn du ein Tier wärst, welches wäre es und warum?
- Meine schönste Erinnerung an einen gemeinsamen Ausflug

**Rechte Seite**

- Foto / Bild
- Meine Wünsche für dich
- Mein Lieblingszitat oder Lebensmotto
- Eine Eigenschaft, die ich von dir lernen möchte
- Wenn du im Lotto gewinnst, wohin reisen wir?
- Alles Liebe, dein/e \_\_

Weitere Vorlagen als Startset: *Klassik / Kindheit*, *Abschied Kolleg:in*,
*Hochzeit / Gästebuch*, *Ruhestand*, *Abi / Schulabschluss*.

### Dynamisches Seitenlayout

Da Fragenanzahl und -länge variieren, ist die Eintragsseite kein starres Bild, sondern
ein Layout-System: feste Zonen (Kopf mit „Eintrag von" + Avatar, Fotobereich,
Grußformel unten) und ein flexibler Fragenblock, der Fragen automatisch auf
linke/rechte Seite und – bei sehr vielen Fragen – auf eine zweite Doppelseite verteilt.
Ornamente werden als dekorative Ebene hinter dem Text platziert und passen sich der
Seitenhöhe an.

## 07 · Moderation

**Pro Buch einstellbar.** Der Admin wählt beim Anlegen (später änderbar):

- **Sofort sichtbar** – abgeschlossene Einträge erscheinen direkt im Buch. Admin kann
  jederzeit bearbeiten, ausblenden oder löschen.
- **Freigabe nötig** – Einträge landen in einer Warteschlange im Admin-Bereich. Erst
  nach „Freigeben" tauchen sie im Buch und im Inhaltsverzeichnis auf. Optional
  E-Mail-Hinweis an den Admin bei neuem Eintrag.

Unabhängig davon: Reihenfolge der Einträge ist per Drag & Drop sortierbar; Standard ist
chronologisch nach Abschlussdatum.

## 08 · Admin-Bereich

- **Buch & Titel** – Name, Untertitel, Begrüßungstext (linke Seite 1), Sprache.
- **Fragen** – Vorlage wählen, Fragen editieren/sortieren, Feldtypen, Pflicht/optional.
- **Design** – Cover-Farbe/Material (z. B. Oxblood, Waldgrün, Nachtblau), Papierton,
  Ornament-Set, Titelprägung.
- **Zugänge** – Admin- und Ansehen-Link anzeigen/kopieren/neu erzeugen, Passwörter
  setzen/entfernen, E-Mail für Wiederherstellung.
- **Einladungen** – offenen Eintragen-Link an/aus, personalisierte Einladungen
  anlegen/benennen/kopieren/zurückziehen; Übersicht „eingeladen / begonnen /
  abgeschlossen". Bearbeitungs-Links je Eintrag als personenbezogen oder „für alle mit
  dem Link" setzen.
- **Einträge** – Liste mit Vorschau, Freigabe-Queue, bearbeiten, ausblenden, löschen,
  sortieren.
- **Export** – ganzes Buch als PDF (druckfähig, Doppelseiten) und ZIP mit allen
  Originalbildern.
- **Lebenszyklus** – Buch „schließen" (keine neuen Einträge), archivieren, endgültig
  löschen (mit Bestätigung).

**Kein Benutzerkonto.** Der Admin-Bereich ist allein durch das Admin-Token (+ optionales
Passwort) geschützt. Nach Eingabe wird eine auf dieses eine Buch begrenzte
Session-Cookie gesetzt. Es gibt bewusst kein zentrales User-Management.

## 09 · Design & Haptik

### Materialsprache

Angelehnt an das Mockup: gealtertes cremefarbenes Papier, sepia-goldene Illustrationen
(Blätter, Bäume, Kaffeetassen, Kompass, Hände), Handschrift-/Versalien-Typografie für
Fragen, brauner Ledereinband mit sichtbarer Bindung. Ziel ist ein *Keepsake*-Gefühl,
kein „Web-Formular".

### Assets & Illustrationen

Das Mockup ist selbst KI-generiert und dient nur als **Stilbeispiel** – es gibt keine
übernehmbaren Original-Assets. Der Look wird eigenständig aufgebaut: eigene Papier- und
Ledertexturen, ein einheitliches Sepia-Ornament-Set (offene/gemeinfreie botanische
Illustrationen bzw. gezielt KI-generierte Zierelemente in abgestimmtem Stil),
Handschrift-/Versalien-Typografie für die Fragen. Ziel ist dieselbe Stimmung wie im
Mockup, nicht dessen Nachbau.

### Bewegung & Ton

- Seitenwechsel: kurze Slide-/Aufdeck-Animation mit Curl-Schatten.
- Optionales, leises Papiergeräusch beim Blättern (per Toggle abschaltbar, Default aus
  auf Mobil).
- `prefers-reduced-motion` respektieren: dann harte Schnitte statt Animation.

### Barrierefreiheit

- Buch-Navigation zusätzlich als lineare, bildschirmleser-freundliche Ansicht („Als
  Liste lesen").
- Tastaturbedienung vollständig, sichtbarer Fokus, ausreichende Kontraste trotz
  Vintage-Optik (Text auf eigener, kontrastreicher Ebene über der Textur).
- Alt-Texte: Nutzer:innen können zu Foto/Zeichnung eine kurze Beschreibung angeben.

## 10 · Technische Architektur

**Empfehlung Stack:** SvelteKit (Frontend + serverseitige Endpunkte) · PostgreSQL ·
Drizzle ORM · Bild-Ablage auf einem Docker-Volume (Option: S3-kompatibel via MinIO) ·
Caddy als Reverse Proxy mit automatischem HTTPS · alles über `docker compose`.
Begründung: eine Codebasis, kleine Runtime (gut für einen 1–2 vCPU-VPS), sehr gut
geeignet für die animierten Buch-Interaktionen. Next.js/Nuxt wären gleichwertige
Alternativen, falls im Team mehr Erfahrung damit besteht.

| Baustein | Wahl | Zweck |
|---|---|---|
| Web-App | SvelteKit (Node-Adapter) | Buch-UI, Schreibansicht, Admin, API-Routen |
| Datenbank | PostgreSQL 16 | Bücher, Fragen, Einträge, Tokens |
| Dateien | Volume `/data/uploads` (opt. MinIO) | Originalbilder, Thumbnails, Zeichnungen (PNG/SVG) |
| Bildverarbeitung | `sharp` | Resize, Thumbnails, EXIF-Strip, WebP |
| Zugriffsschutz Bilder | signierte URLs / Auslieferung durch die App | Bilder nur mit gültigem Buch-Token abrufbar |
| Reverse Proxy | Caddy | TLS (Let's Encrypt), Kompression, Static-Cache |
| Mailversand | siehe 12 | nur Admin-Wiederherstellung & opt. Moderations-Hinweis |
| Backups | Cron: `pg_dump` + Uploads-Sync | tägliche Sicherung, off-site kopieren |

**Container (docker compose):** `app` (SvelteKit-Server) · `db` (PostgreSQL mit eigenem
Volume) · `proxy` (Caddy, Ports 80/443) · `backup` (kleiner Cron-Container, optional) ·
optional `minio` (falls Objektspeicher statt Volume).

## 11 · Datenmodell (Skizze)

| Tabelle | Wichtige Felder |
|---|---|
| `book` | id, title, subtitle, intro_text, design (jsonb: cover, papier, ornamente), moderation_mode (`instant \| review`), status (`open \| closed \| archived`), recovery_email (nullable), created_at |
| `book_access` | book_id, role (`admin \| read`), token_hash, password_hash (nullable), created_at – Basis-Links des Buchs |
| `invite` | id, book_id, label (z. B. „für Anna"), kind (`open \| personal`), token_hash, password_hash (nullable), prefill_name (nullable), max_entries (default 1 bei personal, null bei open), used_count, revoked_at (nullable), created_at |
| `question` | id, book_id, position, label, field_type (`short \| long \| date`), required, section (`left \| right`) |
| `entry` | id, book_id, invite_id (nullable), display_name, position, state (`draft \| submitted \| published \| hidden`), edit_token_hash, edit_scope (`personal \| link`), avatar_asset_id, drawing_asset_id, closing_line, created_at, published_at |
| `entry_answer` | entry_id, question_id, value_text |
| `asset` | id, book_id, entry_id, kind (`avatar \| drawing \| photo`), path, thumb_path, width, height, alt_text, position (jsonb: Rotation/Offset für Polaroids) |
| `recovery_request` | book_id, token_hash, expires_at, used_at |
| `audit_log` | book_id, actor_role, action, meta, created_at |

Tokens werden nie im Klartext gespeichert, nur als Hash. Der Klartext steht
ausschließlich im Link.

## 12 · Sicherheit, Links & Mailversand

### Link-Tokens

- ≥ 128 Bit Entropie, URL-sicher kodiert (z. B. 22–32 Zeichen).
- Serverseitig nur als Hash (Argon2id oder SHA-256 mit Pepper) gespeichert.
- Admin kann jeden Link einzeln neu erzeugen (alter Link wird ungültig).
- Personalisierte Einladungen sind einzeln widerrufbar; eine `personal`-Einladung wird
  nach Erreichen von `max_entries` (Default 1) automatisch inaktiv.
- Bearbeitungs-Link je Eintrag: `personal` = an das Erstell-Gerät/den Einladungskontext
  gebunden, `link` = jede:r mit dem Link darf ändern (Admin-Wahl).

### Passwörter (optional pro Link)

- Argon2id-Hash, Rate-Limiting pro IP + pro Buch, generische Fehlermeldung.
- Nach Erfolg: HttpOnly-, SameSite=Lax-, Secure-Cookie, auf das Buch + die Rolle
  begrenzt, begrenzte Lebensdauer.

### Bilder

Kein direkter statischer Pfad; Auslieferung über die App, die das gültige
Buch-Cookie/Token prüft. Uploads: MIME- & Magic-Byte-Prüfung, Re-Encoding mit `sharp`
(entfernt eingebettete Skripte/EXIF), Größenlimits.

### Missbrauch

- Rate-Limits für Eintrags-Erstellung und Uploads pro IP.
- Optionales, unaufdringliches Bot-Hindernis auf der Schreibansicht (z. B.
  Proof-of-Work / Honeypot statt Captcha).
- Bild-Größen- & Anzahl-Kontingent pro Buch (Speicher-Schutz).

### Empfehlung Mailversand

E-Mail wird nur selten gebraucht (Wiederherstellung, optionaler Moderations-Hinweis).
**Primär:** ein transaktionaler Dienst mit EU-Rechenzentrum und AV-Vertrag – z. B.
*Brevo*, *Mailjet* oder *Postmark (EU)* – angebunden per SMTP. **Alternativ / Fallback:**
generische SMTP-Konfiguration, sodass auch ein eigener Mailserver oder der des
VPS-Anbieters genutzt werden kann. Konfiguration rein über Umgebungsvariablen; ist keine
gesetzt, wird die E-Mail-Wiederherstellung im UI ausgeblendet.

## 13 · Datenschutz & Recht (DE/EU)

- **Hosting** – VPS in Deutschland/EU; Mail-Dienstleister mit EU-Standort +
  Auftragsverarbeitungsvertrag.
- **Rechtsgrundlage** – Eintragende willigen aktiv ein (Text + Checkbox vor dem
  Abschließen), besonders für Foto-Uploads; Hinweis, keine Bilder Dritter ohne deren
  Einverständnis hochzuladen.
- **Datensparsamkeit** – keine Tracker, keine Analytics von Drittanbietern; höchstens
  serverseitige, anonyme Zählung.
- **Löschkonzept** – Eintragende können den eigenen Eintrag über ihren Bearbeitungs-Link
  löschen; Admin kann Einträge und das ganze Buch löschen; „geschlossene" Bücher werden
  nach konfigurierbarer Frist automatisch gelöscht (z. B. 24 Monate Inaktivität, mit
  Vorwarn-Mail falls E-Mail vorhanden).
- **Aufbewahrung** – Backups mit begrenzter Vorhaltezeit (z. B. 30 Tage), dann Rotation.
- **Pflichtseiten** – Impressum & Datenschutzerklärung; Auskunfts-/Löschkontakt.
- **Minderjährige** – da „für Erwachsene" konzipiert: Hinweis in den
  Nutzungsbedingungen; für Kinder-Freundebücher wäre ein zusätzliches
  Einwilligungskonzept nötig (spätere Ausbaustufe).

## 14 · Umsetzung in Stufen

| Stufe | Inhalt |
|---|---|
| **MVP** | Buch anlegen · Admin- / Ansehen- / offener Eintragen-Link (ohne Passwort) · 1 feste Vorlage · Leseansicht mit sanftem Blättern · Inhaltsverzeichnis · Eintrag mit Textfeldern + Avatar + Polaroid-Fotos + Lightbox · veröffentlichte Einträge für Schreibende sichtbar · Moderation „sofort/Freigabe" · Admin: Einträge sehen/löschen · Docker-Setup + Caddy + Backups |
| **V1** | Mini-Zeichnen-Canvas · mehrere Vorlagen · voll editierbare Fragen + dynamisches Seitenlayout · personalisierte Einladungslinks + Übersicht · Passwörter pro Link · E-Mail-Wiederherstellung · Design-Optionen (Cover/Papier/Ornamente) · persönlicher Bearbeitungs-Link · PDF/ZIP-Export · Barrierefreie Listenansicht |
| **Später** | Realistisches 3D-Blättern (StPageFlip) · Blätter-Sound · Buch-Lebenszyklus/Auto-Löschung · weitere Sprachen · Kinder-Variante mit Einwilligungskonzept · gemeinsame „Gruppenseiten" |

## 15 · Offene Punkte

Geklärt: Bearbeitungs-Link für eigene Einträge (personalisiert oder „für alle mit dem
Link", Admin-Wahl) · offener + personalisierte Einladungslinks · veröffentlichte
Einträge sind für Schreibende sichtbar.

- **Domain & Name** – „DigiFriends" ist noch nicht fix. Öffentlicher Produktname +
  Domain zu klären (auch: Mehrsprachigkeit des Namens).
- **Mehrere Bücher pro Betreiber** – braucht es eine simple Übersicht/Sammel-Login,
  oder bleibt jedes Buch komplett für sich (nur über seine Links erreichbar)?
- **Personal-Bearbeitungs-Bindung** – wie streng? Gerätebindung per Cookie ist bequem,
  aber nicht geräteübergreifend – Alternative wäre ein zusätzliches Einmal-Geheimnis
  beim Abschließen.
- **Offener Link + Missbrauch** – reicht Rate-Limit/Honeypot, oder soll der offene Link
  standardmäßig aus sein und nur auf Wunsch aktiviert werden?

---

*Quellen: `idee.md`, KI-Mockup „Digitales Freundebuch für Erwachsene" (Stilreferenz).*
*Nächster Schritt: offene Punkte klären, dann MVP-Scope schneiden.*
