<script lang="ts">
	import { resolve } from '$app/paths';
	import { OPERATOR_NAME, OPERATOR_EMAIL } from '$lib/legal';
</script>

<svelte:head><title>Impressum</title></svelte:head>

<main>
	<section class="card">
		<p class="label">Impressum</p>
		<h1>Angaben zum Projekt</h1>

		<p class="lead">
			DigiFriends ist ein <strong>privates, nicht-kommerzielles Hobbyprojekt</strong> – es wird ohne Gewinnerzielungsabsicht
			betrieben, es gibt keine Werbung und nichts wird verkauft.
		</p>

		<h2>Betrieben von</h2>
		<p>
			{OPERATOR_NAME}<br />
			E-Mail: <a href="mailto:{OPERATOR_EMAIL}">{OPERATOR_EMAIL}</a>
		</p>

		<div class="note">
			<p>
				<strong>Zur Postanschrift:</strong> Da es sich um ein privates, nicht-kommerzielles Projekt handelt,
				wird hier bewusst keine Anschrift veröffentlicht. Für Anfragen, Beschwerden oder rechtliche Anliegen
				genügt die oben genannte E-Mail-Adresse – eine Antwort erfolgt zeitnah. Sollte sich Umfang oder
				Charakter des Projekts ändern (z. B. durch kommerzielle Nutzung), wird diese Seite entsprechend
				angepasst.
			</p>
		</div>

		<h2>Verantwortlich für den Inhalt</h2>
		<p>{OPERATOR_NAME} (Kontakt siehe oben).</p>

		<h2>Haftung für Inhalte</h2>
		<p>
			Als Betreiber dieser Seite bin ich für eigene Inhalte nach den allgemeinen Gesetzen
			verantwortlich. Zu einer ständigen Kontrolle der von Nutzer:innen in ihre eigenen
			Freundebücher eingestellten Inhalte ohne konkreten Anlass bin ich nicht verpflichtet. Bei
			Bekanntwerden entsprechender Rechtsverletzungen werde ich betroffene Inhalte umgehend
			entfernen.
		</p>

		<h2>Inhalte der Nutzer:innen</h2>
		<p>
			Text, Fotos und Zeichnungen in einem Freundebuch werden von den jeweiligen Nutzer:innen selbst
			eingestellt und liegen in ihrer Verantwortung. Wer einen Eintrag verfasst, bestätigt dabei,
			nur Bilder hochzuladen, an denen er/sie die nötigen Rechte hat bzw. für die eine Einwilligung
			der abgebildeten Personen vorliegt.
		</p>

		<h2>Urheberrecht</h2>
		<p>
			Layout, Design und Programmcode dieser Seite unterliegen dem Urheberrecht. Vervielfältigung,
			Bearbeitung oder Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der
			schriftlichen Zustimmung.
		</p>

		<p class="back">
			<a href={resolve('/')}>← Zur Startseite</a> ·
			<a href={resolve('/datenschutz')}>Datenschutzerklärung</a>
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
		max-width: 38rem;
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
	.note {
		background: var(--paper-100);
		border: 1px solid var(--surface-line);
		border-left: 3px solid var(--ochre);
		border-radius: 6px;
		padding: 0.8rem 1rem;
		margin: 0.6rem 0;
		font-size: var(--step--1);
		color: var(--ink-700);
	}
	.back {
		margin-top: 2rem;
		font-size: var(--step--1);
	}
</style>
