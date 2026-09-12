<script lang="ts">
	import { resolve } from '$app/paths';
	import { OPERATOR_NAME, OPERATOR_EMAIL } from '$lib/legal';
</script>

<svelte:head><title>Datenschutzerklärung</title></svelte:head>

<main>
	<section class="card">
		<p class="label">Datenschutz</p>
		<h1>Datenschutzerklärung</h1>
		<p class="lead">
			DigiFriends ist ein privates, nicht-kommerzielles Projekt. Es wird bewusst datensparsam
			betrieben: keine Werbung, kein Tracking, keine Analyse-Tools, keine Weitergabe von Daten an
			Dritte.
		</p>

		<h2>1. Verantwortlicher</h2>
		<p>
			{OPERATOR_NAME}<br />
			E-Mail: <a href="mailto:{OPERATOR_EMAIL}">{OPERATOR_EMAIL}</a>
		</p>

		<h2>2. Hosting &amp; Server-Zugriffsdaten</h2>
		<p>
			Diese Seite läuft auf einem selbst verwalteten Server, nicht bei einem Cloud-Drittanbieter.
			Beim Aufruf einer Seite verarbeitet der vorgeschaltete Server technisch notwendig kurzzeitig
			Verbindungsdaten (u. a. IP-Adresse, Zeitpunkt, aufgerufene Adresse, verwendeter Browser), um
			die Seite überhaupt ausliefern und den Betrieb technisch absichern zu können. Rechtsgrundlage
			ist das berechtigte Interesse an einem funktionierenden und sicheren Betrieb (Art. 6 Abs. 1
			lit. f DSGVO). Es findet keine Auswertung zu Marketing- oder Analysezwecken statt.
		</p>

		<h2>3. Cookies</h2>
		<p>
			Es werden keine Tracking- oder Marketing-Cookies gesetzt. Ein einzelnes technisch notwendiges
			Cookie wird nur gesetzt, wenn ein Buch-Link mit einem Passwort geschützt ist: Es merkt sich
			nach korrekter Eingabe, dass dieser Link schon einmal entsperrt wurde (Name beginnt mit <code
				>bk_</code
			>, Gültigkeit 30 Tage, nur lesbar vom Server, keine Weitergabe an Dritte). Rechtsgrundlage ist
			§ 25 Abs. 2 Nr. 2 TTDSG bzw. Art. 6 Abs. 1 lit. f DSGVO (technisch notwendig für die
			angeforderte Funktion). Eine Einwilligung ist dafür nicht erforderlich.
		</p>

		<h2>4. Schriftarten</h2>
		<p>
			Die verwendeten Schriftarten (Oswald, Crimson Pro, Kalam) werden lokal von diesem Server
			ausgeliefert, nicht von Google Fonts oder einem anderen externen Anbieter geladen. Beim Aufruf
			dieser Seite wird dadurch keine Verbindung zu Google-Servern aufgebaut.
		</p>

		<h2>5. Inhalte eines Freundebuchs</h2>
		<p>
			Wer ein Freundebuch anlegt oder einen Eintrag schreibt, gibt dabei personenbezogene Daten ein
			– z. B. Name, Antworten auf die Fragen, ein Avatarbild, hochgeladene Fotos und optional eine
			Grußformel. Diese Angaben werden ausschließlich zu dem Zweck gespeichert, das jeweilige
			Freundebuch darzustellen. Rechtsgrundlage ist die Einwilligung (Art. 6 Abs. 1 lit. a DSGVO),
			die beim Absenden eines Eintrags aktiv erteilt wird. Die Einwilligung kann jederzeit für die
			Zukunft widerrufen werden, indem der eigene Eintrag über den persönlichen Bearbeitungs-Link
			gelöscht wird oder eine Löschung bei der für das jeweilige Buch verantwortlichen Person (siehe
			dort im Zweifel Admin-Kontakt) angefragt wird.
		</p>
		<p>
			Hochgeladene Fotos werden serverseitig verkleinert und neu kodiert; dabei werden eingebettete
			Metadaten wie Kamerahersteller oder Standortdaten (EXIF) automatisch entfernt.
		</p>
		<p>
			Beim Anlegen eines Buchs kann außerdem freiwillig eine E-Mail-Adresse hinterlegt werden, über
			die im Verlustfall ein neuer Admin-Link angefordert werden kann. Diese Adresse wird
			ausschließlich für diesen Zweck verwendet.
		</p>
		<p>
			<strong>Hinweis zu Bildern Dritter:</strong> Für Fotos, auf denen andere Personen zu sehen sind,
			ist die Person verantwortlich, die den Eintrag verfasst – sie muss sicherstellen, dass eine Einwilligung
			der abgebildeten Personen vorliegt.
		</p>

		<h2>6. Speicherdauer &amp; Löschung</h2>
		<p>
			Bücher und Einträge bleiben gespeichert, bis sie von der Autorin/dem Autor über den
			Bearbeitungs-Link oder von der Buch-Administration gelöscht werden. Ein automatisches Löschen
			inaktiver Bücher nach einer festen Frist ist aktuell noch nicht eingerichtet. Zugriffs-Links
			und Passwörter werden ausschließlich als kryptographischer Hashwert gespeichert, niemals im
			Klartext.
		</p>

		<h2>7. Empfänger, Drittländer</h2>
		<p>
			Es gibt aktuell keine Weitergabe von Daten an Dritte und keine externen Auftragsverarbeiter.
			Ein optionaler E-Mail-Versand (für die Admin-Wiederherstellung) ist derzeit nicht aktiv;
			sollte er künftig aktiviert werden, wird diese Erklärung um Angaben zum eingesetzten Dienst
			ergänzt.
		</p>

		<h2>8. Minderjährige</h2>
		<p>
			Dieses Angebot richtet sich an Erwachsene. Personen unter 16 Jahren sollten ohne Zustimmung
			ihrer Erziehungsberechtigten keine personenbezogenen Daten über diese Seite übermitteln.
		</p>

		<h2>9. Ihre Rechte</h2>
		<p>
			Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
			Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art.
			21) gegen die Verarbeitung Ihrer Daten. Eine erteilte Einwilligung können Sie jederzeit mit
			Wirkung für die Zukunft widerrufen. Wenden Sie sich dazu an die oben genannte E-Mail-Adresse.
			Außerdem steht Ihnen ein Beschwerderecht bei der für Sie zuständigen
			Datenschutz-Aufsichtsbehörde zu.
		</p>

		<h2>10. Änderungen</h2>
		<p>
			Diese Erklärung wird angepasst, sobald sich die tatsächliche Datenverarbeitung ändert (z. B.
			neue Funktionen wie E-Mail-Versand). Es lohnt sich, bei Bedarf hier vorbeizuschauen.
		</p>

		<p class="back">
			<a href={resolve('/')}>← Zur Startseite</a> · <a href={resolve('/impressum')}>Impressum</a>
		</p>
	</section>
</main>

<style>
	main {
		display: grid;
		place-items: start center;
		min-height: calc(100vh - var(--footer-h));
		padding: clamp(1.5rem, 6vw, 4rem) 16px;
	}
	.card {
		max-width: 42rem;
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 12px;
		padding: clamp(1.6rem, 1rem + 4vw, 2.8rem);
		box-shadow: 0 24px 50px -30px var(--shadow-book);
		margin-top: clamp(1rem, 4vh, 3rem);
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		margin: 0.2rem 0 0.9rem;
	}
	h2 {
		font-family: var(--font-label);
		font-size: var(--step-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 1.6rem 0 0.5rem;
	}
	.lead {
		color: var(--ink-700);
	}
	code {
		font-family: var(--font-label);
		font-size: 0.9em;
		background: var(--paper-100);
		border: 1px solid var(--surface-line);
		border-radius: 4px;
		padding: 0.05em 0.35em;
	}
	.back {
		margin-top: 2rem;
		font-size: var(--step--1);
	}
</style>
