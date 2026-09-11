<script lang="ts">
	import { resolve } from '$app/paths';

	const steps = [
		{
			title: 'Buch anlegen',
			text: 'Titel, Begrüßungstext und eine Fragen-Vorlage wählen. Fertig in einer Minute, ganz ohne Registrierung.'
		},
		{
			title: 'Link teilen',
			text: 'Jede eingeladene Person bekommt einen Link zum Eintragen. Niemand braucht ein Konto oder eine App.'
		},
		{
			title: 'Gemeinsam blättern',
			text: 'Antworten, Avatare und Fotos wachsen zu einem echten, durchblätterbaren Buch zusammen.'
		}
	];

	const features = [
		{
			title: 'Wie ein echtes Buch',
			text: 'Bindung, Papierstruktur und ein sanftes Umblättern statt einer bloßen Formularliste.'
		},
		{
			title: 'Fotos & Avatar',
			text: 'Polaroid-Fotos zum Vergrößern und ein rundes Profilbild für jeden Eintrag.'
		},
		{
			title: 'Ohne Konto',
			text: 'Zugang per Link – für Verwalten, Eintragen und Ansehen getrennt, optional mit eigenem Passwort.'
		},
		{
			title: 'Volle Kontrolle',
			text: 'Als Admin bestimmst du die Fragen, ob Einträge sofort erscheinen, und wer eintragen darf.'
		},
		{
			title: 'Privat betrieben',
			text: 'Kein Tracking, keine Werbung, keine Cloud-Dienste Dritter – ein selbst gehostetes Hobbyprojekt.'
		},
		{
			title: 'Frei gestaltbar',
			text: 'Vorlagen für Erwachsene, Kindheit, Abschied oder Hochzeit – und jede Frage lässt sich anpassen.'
		}
	];
</script>

<svelte:head><title>Digitales Freundebuch</title></svelte:head>

<main>
	<article class="card">
		<section class="hero">
			<p class="eyebrow">✦ Kein Konto · Kein Aufwand</p>
			<h1>Digitales Freundebuch</h1>
			<p class="lead">
				Ein Freundebuch, das sich im Browser wirklich wie ein Buch anfühlt – aufschlagen, blättern,
				eintragen. Für Abschiede, Geburtstage, Reisen oder einfach, weil ihr euch mögt.
			</p>
			<p class="actions">
				<a class="cta" href={resolve('/neu')}>Freundebuch anlegen</a>
				<a class="secondary" href={resolve('/demo')}>Demo ansehen →</a>
			</p>
		</section>

		<hr />

		<section>
			<h2>So funktioniert's</h2>
			<ol class="steps">
				{#each steps as step, i (step.title)}
					<li>
						<span class="steps__num">{i + 1}</span>
						<h3>{step.title}</h3>
						<p>{step.text}</p>
					</li>
				{/each}
			</ol>
		</section>

		<hr />

		<section>
			<h2>Was das Buch kann</h2>
			<div class="features">
				{#each features as f (f.title)}
					<div class="feature">
						<h3>{f.title}</h3>
						<p>{f.text}</p>
					</div>
				{/each}
			</div>
		</section>

		<p class="closing">
			Neugierig, wie sich das anfühlt? <a href={resolve('/demo')}>Schau dir die Demo an</a> – oder
			<a href={resolve('/neu')}>leg direkt dein eigenes Buch an</a>.
		</p>
	</article>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		padding: clamp(1.5rem, 6vw, 4rem) 16px clamp(2rem, 8vh, 5rem);
	}
	.card {
		max-width: 54rem;
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 16px;
		padding: clamp(1.8rem, 1.2rem + 4vw, 3.4rem);
		box-shadow: 0 30px 60px -30px var(--shadow-book);
	}

	.hero {
		max-width: 38rem;
	}
	.eyebrow {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ochre-deep);
		margin: 0 0 0.9rem;
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		line-height: 1.05;
		margin: 0 0 0.9rem;
	}
	.lead {
		font-size: var(--step-1);
		color: var(--ink-700);
		margin: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.4rem;
		margin: 1.8rem 0 0;
	}
	.cta {
		background: var(--oxblood);
		color: var(--paper-100);
		border-radius: 999px;
		padding: 0.75rem 1.5rem;
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: var(--step--1);
		text-decoration: none;
	}
	.secondary {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		color: var(--ink-700);
	}

	hr {
		border: 0;
		border-top: 1px solid var(--surface-line);
		margin: clamp(1.8rem, 4vw, 2.6rem) 0;
	}

	h2 {
		font-family: var(--font-label);
		font-size: var(--step-0);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-700);
		margin: 0 0 1.3rem;
	}
	h3 {
		font-family: var(--font-label);
		font-weight: 600;
		font-size: var(--step-0);
		margin: 0 0 0.3rem;
	}

	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.4rem;
	}
	@media (min-width: 700px) {
		.steps {
			grid-template-columns: repeat(3, 1fr);
			gap: 1.8rem;
		}
	}
	.steps li p {
		margin: 0;
		color: var(--ink-500);
		font-size: var(--step--1);
	}
	.steps__num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 50%;
		background: var(--oxblood);
		color: var(--paper-100);
		font-family: var(--font-label);
		font-size: var(--step--1);
		margin-bottom: 0.6rem;
	}

	.features {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.1rem;
	}
	@media (min-width: 560px) {
		.features {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (min-width: 900px) {
		.features {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.feature {
		background: var(--paper-100);
		border: 1px solid var(--surface-line);
		border-radius: 10px;
		padding: 1rem 1.1rem;
	}
	.feature p {
		margin: 0;
		font-size: var(--step--1);
		color: var(--ink-500);
	}

	.closing {
		margin: clamp(1.8rem, 4vw, 2.6rem) 0 0;
		font-size: var(--step--1);
		color: var(--ink-500);
	}
</style>
