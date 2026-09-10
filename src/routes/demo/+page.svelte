<script lang="ts">
	import Book from '$lib/book/Book.svelte';
	import BookPage from '$lib/book/BookPage.svelte';

	// Demo-Inhalt zum Entwickeln der Buch-Optik – noch keine echten Daten.
	const toc = [
		{ name: 'Anna Berger', page: 1 },
		{ name: 'Jonas Klein', page: 2 },
		{ name: 'Mira Sahin', page: 3 }
	];

	const questionsLeft = [
		{
			q: 'Wie haben wir uns kennengelernt?',
			a: 'Auf der Zugfahrt nach Hamburg, du hattest den besseren Kaffee dabei.'
		},
		{
			q: 'Unser lustigster gemeinsamer Moment:',
			a: 'Als wir uns im Baumarkt verlaufen haben und mit drei Pflanzen rauskamen.'
		},
		{
			q: 'Wenn du ein Tier wärst, welches wäre es und warum?',
			a: 'Ein Otter – immer in Bewegung, aber nie ohne Snack.'
		},
		{
			q: 'Meine schönste Erinnerung an einen gemeinsamen Ausflug:',
			a: 'Der Sonnenaufgang auf dem Brocken, halb erfroren, aber glücklich.'
		}
	];
	const questionsRight = [
		{
			q: 'Meine Wünsche für dich:',
			a: 'Mehr ruhige Morgen und weniger Termine, die du eigentlich nicht willst.'
		},
		{ q: 'Mein Lieblingszitat oder Lebensmotto:', a: '„Man sieht nur mit dem Herzen gut.“' },
		{
			q: 'Eine Eigenschaft, die ich von dir lernen möchte:',
			a: 'Deine Ruhe, wenn alle anderen schon in Panik sind.'
		},
		{
			q: 'Wenn du im Lotto gewinnst, wohin reisen wir?',
			a: 'Ans Nordkap, mit einem viel zu großen Camper.'
		}
	];
</script>

{#snippet intro()}
	<BookPage side="left" number={1}>
		<div class="reading">
			<h2 class="reading__title">Willkommen</h2>
			<p>
				Dieses Buch gehört uns allen. Trag dich ein, wie du magst – ehrlich, albern, ausführlich
				oder in drei Sätzen. Ein Foto, eine Zeichnung, eine Erinnerung: alles darf hier hinein.
			</p>
			<p>Blättere rechts weiter zum Inhaltsverzeichnis und schau, wer schon da war.</p>
			<p class="reading__sign hand">— Anna &amp; Jonas</p>
		</div>
	</BookPage>
{/snippet}

{#snippet contents()}
	<BookPage side="right" number={2}>
		<div class="reading">
			<h2 class="reading__title">Inhalt</h2>
			<ol class="toc">
				{#each toc as item (item.name)}
					<li>
						<span class="toc__name">{item.name}</span>
						<span class="toc__dots" aria-hidden="true"></span>
						<span class="toc__page">{item.page}</span>
					</li>
				{/each}
			</ol>
		</div>
	</BookPage>
{/snippet}

{#snippet entryLeft()}
	<BookPage side="left" number={3}>
		<div class="entry">
			<p class="entry__from label">Eintrag von: <span class="hand">Anna Berger</span></p>
			<dl class="entry__qa">
				{#each questionsLeft as item (item.q)}
					<div>
						<dt class="label">{item.q}</dt>
						<dd class="hand">{item.a}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</BookPage>
{/snippet}

{#snippet entryRight()}
	<BookPage side="right" number={4}>
		<div class="entry">
			<div class="polaroid" aria-hidden="true"><span>Foto</span></div>
			<dl class="entry__qa">
				{#each questionsRight as item (item.q)}
					<div>
						<dt class="label">{item.q}</dt>
						<dd class="hand">{item.a}</dd>
					</div>
				{/each}
			</dl>
			<p class="entry__closing hand">Alles Liebe, deine Anna</p>
		</div>
	</BookPage>
{/snippet}

<main>
	<Book
		title="Unser Freundebuch"
		subtitle="Sommer 2026"
		pages={[intro, contents, entryLeft, entryRight]}
	/>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	.reading {
		max-width: var(--maxw-read);
		font-size: var(--step-0);
	}
	.reading__title {
		font-size: var(--step-2);
		margin-bottom: 0.8rem;
		color: var(--ochre-deep);
	}
	.reading__sign {
		margin-top: 1.6rem;
		font-size: var(--step-1);
		color: var(--ink-700);
	}

	.toc {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.toc li {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.45rem 0;
		font-size: var(--step-1);
	}
	.toc__dots {
		flex: 1;
		border-bottom: 1.5px dotted var(--paper-line);
		transform: translateY(-0.15em);
	}
	.toc__page {
		font-variant-numeric: tabular-nums;
		color: var(--ink-500);
	}

	.entry {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.entry__from {
		font-size: var(--step-1);
		letter-spacing: 0.06em;
		margin-bottom: 1rem;
		color: var(--ink-700);
	}
	.entry__from .hand {
		text-transform: none;
		letter-spacing: 0;
		font-size: 1.15em;
	}
	.entry__qa {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.entry__qa dt {
		font-size: var(--step--1);
		letter-spacing: 0.06em;
		color: var(--ink-500);
	}
	.entry__qa dd {
		margin: 0.15rem 0 0;
		font-size: var(--step-1);
		line-height: 1.35;
		color: var(--ink-900);
		border-bottom: 1.5px solid var(--paper-line);
		padding-bottom: 0.35rem;
	}
	.entry__closing {
		margin-top: auto;
		padding-top: 1rem;
		text-align: right;
		font-size: var(--step-1);
		color: var(--ink-700);
	}

	.polaroid {
		align-self: flex-end;
		width: 8.5rem;
		height: 9.5rem;
		margin-bottom: 1rem;
		padding: 0.6rem 0.6rem 1.6rem;
		background: #fffdf6;
		border: 1px solid var(--paper-edge);
		box-shadow: 0 8px 18px -8px var(--shadow-page);
		transform: rotate(2.5deg);
		display: grid;
	}
	.polaroid span {
		display: grid;
		place-items: center;
		background: var(--paper-300);
		color: var(--ink-300);
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: var(--step--1);
	}
</style>
