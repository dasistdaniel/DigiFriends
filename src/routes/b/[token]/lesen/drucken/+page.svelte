<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import BookPage from '$lib/book/BookPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const book = $derived(data.locked ? null : data.book);
	const entries = $derived(data.locked ? [] : data.entries);

	const backHref = $derived(resolve('/b/[token]/lesen', { token: page.params.token! }));
</script>

<svelte:head>
	<title>{book?.title ?? 'Freundebuch'} – PDF-Export</title>
</svelte:head>

{#if book}
	<div class="toolbar">
		<a href={backHref}>← Zurück zum Buch</a>
		<p class="toolbar__hint">
			DIN A4 quer, je Eintrag ein Blatt mit zwei DIN-A5-Seiten im Buch-Design – zum Drucken oder als
			PDF speichern.
		</p>
		<button type="button" onclick={() => window.print()}>Drucken / Als PDF speichern</button>
	</div>

	<main class="preview">
		<div class="sheet">
			<BookPage side="left" theme={book.theme} plain>
				<div class="cover">
					<h1>{book.title}</h1>
					{#if book.subtitle}<p class="cover__sub">{book.subtitle}</p>{/if}
					{#if book.introText}
						{#each book.introText.split(/\n{2,}/) as para (para)}
							<p>{para}</p>
						{/each}
					{/if}
				</div>
			</BookPage>
			<BookPage side="right" theme={book.theme} plain>
				<div class="empty-half" aria-hidden="true"></div>
			</BookPage>
		</div>

		{#each entries as e (e.id)}
			<div class="sheet">
				<BookPage side="left" theme={book.theme} plain>
					<div class="entry">
						<div class="entry__head">
							<p class="entry__from label">
								Eintrag von: <span class="hand">{e.displayName}</span>
							</p>
							{#if e.avatar}
								<img class="entry__avatar" src={e.avatar.thumb} alt={`Foto von ${e.displayName}`} />
							{/if}
						</div>
						<dl class="entry__qa">
							{#each e.leftAnswers as a (a.label)}
								<div>
									<dt class="label">{a.label}</dt>
									<dd class="hand">{a.value}</dd>
								</div>
							{/each}
						</dl>
					</div>
				</BookPage>
				<BookPage side="right" theme={book.theme} plain>
					<div class="entry">
						{#if e.drawings.length || e.photos.length}
							<div class="polaroids">
								{#each e.drawings as drawing (drawing.id)}
									<span class="polaroid" style="--rot: {drawing.rotate}deg">
										<img src={drawing.thumb} alt={`Zeichnung von ${e.displayName}`} />
									</span>
								{/each}
								{#each e.photos as photo (photo.id)}
									<span class="polaroid" style="--rot: {photo.rotate}deg">
										<img src={photo.thumb} alt={`Foto zum Eintrag von ${e.displayName}`} />
									</span>
								{/each}
							</div>
						{/if}
						<dl class="entry__qa">
							{#each e.rightAnswers as a (a.label)}
								<div>
									<dt class="label">{a.label}</dt>
									<dd class="hand">{a.value}</dd>
								</div>
							{/each}
						</dl>
						<p class="entry__closing hand">
							{e.closingLine || `Alles Liebe, ${e.displayName}`}
						</p>
					</div>
				</BookPage>
			</div>
		{/each}
	</main>
{/if}

<style>
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 1rem 16px;
		background: var(--surface);
		border-bottom: 1px solid var(--surface-line);
		font-family: var(--font-label);
		font-size: var(--step--1);
	}
	.toolbar a {
		color: var(--ink-700);
	}
	.toolbar__hint {
		margin: 0;
		flex: 1;
		min-width: 14rem;
		font-family: var(--font-body);
		color: var(--ink-700);
	}
	.toolbar button {
		background: var(--oxblood);
		color: var(--paper-100);
		border: 0;
		border-radius: 999px;
		padding: 0.6rem 1.2rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-family: inherit;
		font-size: inherit;
		cursor: pointer;
	}

	/* Bildschirm-Vorschau: Blaetter in tatsaechlicher physischer Groesse
	   (mm-Einheiten), damit die Vorschau der Druckausgabe entspricht. */
	.preview {
		padding: 2rem 16px 4rem;
		overflow-x: auto;
		background: var(--room);
	}
	.sheet {
		display: flex;
		width: 297mm;
		height: 210mm;
		margin: 0 auto 2rem;
		box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);
	}
	.sheet :global(.page) {
		width: 148.5mm;
		height: 210mm;
		flex-shrink: 0;
	}

	.cover {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		gap: 0.6rem;
	}
	.cover h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		color: var(--ochre-deep);
	}
	.cover__sub {
		color: var(--ink-500);
	}
	.empty-half {
		height: 100%;
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
	.polaroids {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-bottom: 1.2rem;
		align-self: flex-end;
	}
	.polaroid {
		display: block;
		width: 5.2rem;
		height: 6rem;
		padding: 0.3rem 0.3rem 0.9rem;
		background: #fffdf6;
		border: 1px solid var(--paper-edge);
		box-shadow: 0 6px 14px -8px var(--shadow-page);
		transform: rotate(var(--rot, 0deg));
		overflow: hidden;
	}
	.polaroid img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
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

	@media print {
		@page {
			size: A4 landscape;
			margin: 0;
		}
		:global(body) {
			background: #fff !important;
			padding-bottom: 0 !important;
		}
		:global(.site-footer) {
			display: none !important;
		}
		.toolbar {
			display: none !important;
		}
		.preview {
			padding: 0;
			overflow: visible;
			background: #fff;
		}
		.sheet {
			margin: 0;
			box-shadow: none;
			break-after: page;
		}
		.sheet:last-child {
			break-after: auto;
		}
	}
</style>
