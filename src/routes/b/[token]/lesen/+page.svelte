<script lang="ts">
	import Book from '$lib/book/Book.svelte';
	import BookPage from '$lib/book/BookPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Wenn gesperrt, übernimmt das Layout die Passwort-Abfrage.
	const book = $derived(data.locked ? null : data.book);
	const questions = $derived(data.locked ? [] : data.questions);
	const entries = $derived(data.locked ? [] : data.entries);

	const leftQuestions = $derived(questions.filter((q) => q.section === 'left'));
	const rightQuestions = $derived(questions.filter((q) => q.section === 'right'));

	const TOC_PER_PAGE = 10;
	const tocPages = $derived(Math.max(1, Math.ceil(entries.length / TOC_PER_PAGE)));
	const firstEntryPage = $derived(1 + tocPages);
	const pageCount = $derived(firstEntryPage + entries.length * 2);

	function entryStartPage(entryIndex: number) {
		return firstEntryPage + entryIndex * 2;
	}

	let bookRef = $state<Book | undefined>();
	let lightbox = $state<string | null>(null);
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') lightbox = null;
	}}
/>

<svelte:head><title>{book?.title ?? 'Freundebuch'}</title></svelte:head>

{#if book}
	{#snippet page(i: number)}
		{#if i === 0}
			<BookPage side="left" number={1} theme={book.theme}>
				<div class="reading">
					<h2 class="reading__title">{book.title}</h2>
					{#if book.subtitle}<p class="reading__sub">{book.subtitle}</p>{/if}
					{#if book.introText}
						{#each book.introText.split(/\n{2,}/) as para (para)}
							<p>{para}</p>
						{/each}
					{:else}
						<p>Willkommen in diesem Freundebuch. Blättere rechts weiter zum Inhaltsverzeichnis.</p>
					{/if}
				</div>
			</BookPage>
		{:else if i < firstEntryPage}
			{@const tocIndex = i - 1}
			{@const slice = entries.slice(
				tocIndex * TOC_PER_PAGE,
				tocIndex * TOC_PER_PAGE + TOC_PER_PAGE
			)}
			<BookPage side={i % 2 === 0 ? 'right' : 'left'} number={i + 1} theme={book.theme}>
				<div class="reading">
					{#if tocIndex === 0}<h2 class="reading__title">Inhalt</h2>{/if}
					{#if entries.length === 0}
						<p class="empty">Noch keine Einträge. Sei die erste Person!</p>
					{:else}
						<ol class="toc" start={tocIndex * TOC_PER_PAGE + 1}>
							{#each slice as e, k (e.id)}
								{@const entryIndex = tocIndex * TOC_PER_PAGE + k}
								<li>
									<button
										type="button"
										class="toc__link"
										onclick={() => bookRef?.goto(entryStartPage(entryIndex))}
									>
										<span class="toc__name">{e.displayName}</span>
										<span class="toc__dots" aria-hidden="true"></span>
										<span class="toc__page">{entryStartPage(entryIndex) + 1}</span>
									</button>
								</li>
							{/each}
						</ol>
					{/if}
				</div>
			</BookPage>
		{:else}
			{@const idx = i - firstEntryPage}
			{@const e = entries[Math.floor(idx / 2)]}
			{@const side = idx % 2 === 0 ? 'left' : 'right'}
			<BookPage {side} number={i + 1} theme={book.theme}>
				<div class="entry">
					{#if side === 'left'}
						<div class="entry__head">
							<p class="entry__from label">
								Eintrag von: <span class="hand">{e.displayName}</span>
							</p>
							{#if e.avatar}
								<img class="entry__avatar" src={e.avatar.thumb} alt={`Foto von ${e.displayName}`} />
							{/if}
						</div>
						<dl class="entry__qa">
							{#each leftQuestions as q (q.id)}
								<div>
									<dt class="label">{q.label}</dt>
									<dd class="hand">{e.answers[q.id] || '—'}</dd>
								</div>
							{/each}
						</dl>
					{:else}
						{#if e.drawings.length || e.photos.length}
							<div class="polaroids">
								{#each e.drawings as drawing (drawing.id)}
									<button
										type="button"
										class="polaroid"
										style="--rot: {drawing.rotate}deg"
										onclick={() => (lightbox = drawing.full)}
									>
										<img src={drawing.thumb} alt={`Zeichnung von ${e.displayName}`} />
									</button>
								{/each}
								{#each e.photos as photo (photo.id)}
									<button
										type="button"
										class="polaroid"
										style="--rot: {photo.rotate}deg"
										onclick={() => (lightbox = photo.full)}
									>
										<img src={photo.thumb} alt={`Foto zum Eintrag von ${e.displayName}`} />
									</button>
								{/each}
							</div>
						{/if}
						<dl class="entry__qa">
							{#each rightQuestions as q (q.id)}
								<div>
									<dt class="label">{q.label}</dt>
									<dd class="hand">{e.answers[q.id] || '—'}</dd>
								</div>
							{/each}
						</dl>
						<p class="entry__closing hand">
							{e.closingLine || `Alles Liebe, ${e.displayName}`}
						</p>
					{/if}
				</div>
			</BookPage>
		{/if}
	{/snippet}

	<main>
		<Book
			bind:this={bookRef}
			title={book.title}
			subtitle={book.subtitle ?? undefined}
			theme={book.theme}
			{pageCount}
			{page}
		/>
	</main>

	{#if lightbox}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="lightbox" onclick={() => (lightbox = null)}>
			<img src={lightbox} alt="Foto in groß" />
			<button type="button" class="lightbox__x" aria-label="Schließen">×</button>
		</div>
	{/if}
{/if}

<style>
	main {
		min-height: calc(100vh - var(--footer-h));
		display: flex;
	}

	.reading {
		max-width: var(--maxw-read);
	}
	.reading__title {
		font-size: var(--step-2);
		margin-bottom: 0.6rem;
		color: var(--ochre-deep);
	}
	.reading__sub {
		color: var(--ink-500);
		margin-top: -0.3rem;
	}
	.empty {
		color: var(--ink-300);
	}

	.toc {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.toc li {
		border-bottom: 1px solid transparent;
	}
	.toc__link {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		width: 100%;
		background: none;
		border: 0;
		padding: 0.4rem 0;
		font: inherit;
		font-size: var(--step-1);
		color: var(--ink-900);
		cursor: pointer;
		text-align: left;
	}
	.toc__link:hover .toc__name {
		color: var(--ochre-deep);
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
	.entry__avatar {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #fffdf6;
		box-shadow: 0 4px 12px -6px var(--shadow-page);
		flex-shrink: 0;
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
		max-width: min(92vw, 900px);
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
		white-space: pre-wrap;
	}
	.entry__closing {
		margin-top: auto;
		padding-top: 1rem;
		text-align: right;
		font-size: var(--step-1);
		color: var(--ink-700);
	}
</style>
