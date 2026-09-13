<script lang="ts">
	import Book from '$lib/book/Book.svelte';
	import BookPage from '$lib/book/BookPage.svelte';
	import { bookThemes, defaultBookThemeId } from '$lib/bookThemes';

	let theme = $state(defaultBookThemeId);

	// Demo-Inhalt zum Zeigen der Buch-Optik – keine echten Nutzerdaten.
	// Platzhalterbilder sind selbst gezeichnete SVGs (kein Fremdmaterial),
	// damit die Demo zeigt, wie Avatar/Fotos im echten Buch aussehen.
	function svg(markup: string) {
		return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
	}

	const avatar = svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
		<circle cx='50' cy='50' r='50' fill='#6f7d5f'/>
		<text x='50' y='64' font-family='Georgia, serif' font-size='38' fill='#f7f1e1' text-anchor='middle'>AB</text>
	</svg>`);

	const photoSunrise = svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
		<rect width='200' height='200' fill='#f0e2c0'/>
		<circle cx='142' cy='58' r='26' fill='#d99a3f'/>
		<polygon points='0,200 55,95 95,150 135,80 200,200' fill='#7a5a3a'/>
		<polygon points='0,200 55,95 82,138 55,200' fill='#5c4128' opacity='0.55'/>
	</svg>`);

	const photoCoffee = svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
		<rect width='200' height='200' fill='#ece2c8'/>
		<path d='M55 95h50v38a25 25 0 0 1-50 0z' fill='#6e2f2a'/>
		<path d='M105 100c14-2 22 6 20 16s-14 12-20 10' fill='none' stroke='#6e2f2a' stroke-width='6'/>
		<path d='M115 95h50v30a25 25 0 0 1-50 0z' fill='#a9762c'/>
		<path d='M165 98c12-2 19 5 17 14s-12 10-17 8' fill='none' stroke='#a9762c' stroke-width='6'/>
		<path d='M70 82c4-8-4-10 0-18M180 80c4-8-4-10 0-18' stroke='#8a7f6d' stroke-width='4' fill='none' stroke-linecap='round'/>
	</svg>`);

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

	const drawing = svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'>
		<rect width='200' height='140' fill='#ffffff'/>
		<circle cx='166' cy='30' r='16' fill='none' stroke='#a9762c' stroke-width='4'/>
		<path d='M166 4v8M166 48v8M140 30h8M184 30h8M148 12l6 6M178 42l6 6M184 12l-6 6M154 42l-6 6' stroke='#a9762c' stroke-width='3' stroke-linecap='round'/>
		<path d='M20 110c30-40 60-40 90 0' stroke='#6f7d5f' stroke-width='4' fill='none' stroke-linecap='round'/>
		<path d='M8 120c40-8 60 6 90-4s60 4 94-6' stroke='#2f5f8a' stroke-width='4' fill='none' stroke-linecap='round'/>
		<path d='M70 78c-10-12 2-24 12-14 10-10 22 2 12 14-6 6-12 10-12 10s-6-4-12-10z' fill='#a13d63'/>
	</svg>`);

	const photos = [
		{ id: 'sunrise', src: photoSunrise, rotate: -3 },
		{ id: 'coffee', src: photoCoffee, rotate: 2.5 }
	];

	let lightbox = $state<string | null>(null);
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') lightbox = null;
	}}
/>

{#snippet intro()}
	<BookPage side="left" number={1} {theme}>
		<div class="reading">
			<h2 class="reading__title">Willkommen</h2>
			<p>
				Dieses Buch gehört uns allen. Trag dich ein, wie du magst – ehrlich, albern, ausführlich
				oder in drei Sätzen. Ein Foto, ein Avatar, eine Erinnerung: alles darf hier hinein.
			</p>
			<p>Blättere rechts weiter zum Inhaltsverzeichnis und schau, wer schon da war.</p>
			<p class="reading__sign hand">— Anna &amp; Jonas</p>
		</div>
	</BookPage>
{/snippet}

{#snippet contents()}
	<BookPage side="right" number={2} {theme}>
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
	<BookPage side="left" number={3} {theme}>
		<div class="entry">
			<div class="entry__head">
				<p class="entry__from label">Eintrag von: <span class="hand">Anna Berger</span></p>
				<img class="entry__avatar" src={avatar} alt="Avatar von Anna Berger" />
			</div>
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
	<BookPage side="right" number={4} {theme}>
		<div class="entry">
			<div class="polaroids">
				<button
					type="button"
					class="polaroid"
					style="--rot: -4deg"
					onclick={() => (lightbox = drawing)}
				>
					<img src={drawing} alt="Zeichnung-Erinnerung (Demo)" />
				</button>
				{#each photos as photo (photo.id)}
					<button
						type="button"
						class="polaroid"
						style="--rot: {photo.rotate}deg"
						onclick={() => (lightbox = photo.src)}
					>
						<img src={photo.src} alt="Foto-Erinnerung (Demo)" />
					</button>
				{/each}
			</div>
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

{#snippet page(i: number)}
	{#if i === 0}
		{@render intro()}
	{:else if i === 1}
		{@render contents()}
	{:else if i === 2}
		{@render entryLeft()}
	{:else}
		{@render entryRight()}
	{/if}
{/snippet}

<main>
	<div class="demo-stack">
		<div class="theme-switch" role="radiogroup" aria-label="Einband-Design">
			{#each bookThemes as t (t.id)}
				<button
					type="button"
					class="theme-switch__btn"
					class:theme-switch__btn--on={theme === t.id}
					style:background={`linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})`}
					aria-pressed={theme === t.id}
					title={t.name}
					onclick={() => (theme = t.id)}
				>
					<span class="visually-hidden">{t.name}</span>
				</button>
			{/each}
		</div>
		<div class="book-slot">
			<Book title="Unser Freundebuch" subtitle="Sommer 2026" {theme} pageCount={4} {page} />
		</div>
	</div>
</main>

{#if lightbox}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="lightbox" onclick={() => (lightbox = null)}>
		<img src={lightbox} alt="Foto in groß (Demo)" />
		<button type="button" class="lightbox__x" aria-label="Schließen">×</button>
	</div>
{/if}

<style>
	main {
		min-height: calc(100vh - var(--footer-h));
		display: flex;
	}
	.demo-stack {
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.theme-switch {
		flex: 0 0 auto;
		display: flex;
		justify-content: center;
		gap: 0.55rem;
		padding: 0.9rem 16px 0;
	}
	.theme-switch__btn {
		width: 1.9rem;
		height: 1.9rem;
		padding: 0;
		border-radius: 50%;
		border: 2px solid var(--surface);
		box-shadow: 0 0 0 1px var(--surface-line);
		cursor: pointer;
	}
	.theme-switch__btn--on {
		box-shadow: 0 0 0 2px var(--ink-700);
	}
	.book-slot {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
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
	.entry__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.entry__from {
		font-size: var(--step-1);
		letter-spacing: 0.06em;
		color: var(--ink-700);
	}
	.entry__from .hand {
		text-transform: none;
		letter-spacing: 0;
		font-size: 1.15em;
	}
	.entry__avatar {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #fffdf6;
		box-shadow: 0 4px 12px -6px var(--shadow-page);
		flex-shrink: 0;
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

	.polaroids {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-bottom: 1.2rem;
		align-self: flex-end;
	}
	.polaroid {
		width: 5.2rem;
		height: 6rem;
		padding: 0.3rem 0.3rem 0.9rem;
		background: #fffdf6;
		border: 1px solid var(--paper-edge);
		box-shadow: 0 6px 14px -8px var(--shadow-page);
		transform: rotate(var(--rot, 0deg));
		cursor: pointer;
		overflow: hidden;
	}
	.polaroid img {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 0;
		object-fit: cover;
	}

	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: rgba(20, 12, 6, 0.86);
		display: grid;
		place-items: center;
		padding: 24px;
		cursor: zoom-out;
	}
	.lightbox img {
		max-width: min(92vw, 600px);
		max-height: 90vh;
		border-radius: 4px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}
	.lightbox__x {
		position: fixed;
		top: 1rem;
		right: 1.2rem;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 50%;
		border: 0;
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
		font-size: 1.4rem;
		cursor: pointer;
	}
</style>
