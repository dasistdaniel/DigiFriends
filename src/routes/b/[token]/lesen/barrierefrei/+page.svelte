<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import BookPage from '$lib/book/BookPage.svelte';
	import EntrySpread from '$lib/book/EntrySpread.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const book = $derived(data.locked ? null : data.book);
	const entries = $derived(data.locked ? [] : data.entries);

	const backHref = $derived(resolve('/b/[token]/lesen', { token: page.params.token! }));
</script>

<svelte:head>
	<title>{book?.title ?? 'Freundebuch'} – Barrierefreie Ansicht</title>
</svelte:head>

{#if book}
	<div class="toolbar">
		<a href={backHref}>← Zurück zum Buch</a>
		<p class="toolbar__hint">
			Gleiches Design wie im Buch, aber ohne Animation, mit gut lesbarer Schrift und ohne feste
			Seitengröße – für Screenreader, Tastatur-Navigation oder starken Zoom.
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

		{#if entries.length === 0}
			<p class="empty">Noch keine veröffentlichten Einträge.</p>
		{/if}

		{#each entries as e (e.id)}
			<div class="sheet">
				<EntrySpread entry={e} theme={book.theme} readableFont />
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

	/* Kein festes Papierformat: die zwei Seiten liegen nebeneinander, solange
	   Platz ist, und rutschen bei schmalem Viewport/starkem Zoom einfach
	   untereinander - kein erzwungenes horizontales Scrollen. */
	.preview {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 16px 4rem;
	}
	.sheet {
		display: flex;
		flex-wrap: wrap;
		margin: 0 auto 2rem;
		box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.35);
	}
	.sheet :global(.page) {
		flex: 1 1 20rem;
		min-width: 18rem;
	}
	.empty {
		text-align: center;
		color: var(--ink-700);
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
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--step-3);
		color: var(--ink-900);
	}
	.cover__sub {
		color: var(--ink-700);
	}
	.empty-half {
		height: 100%;
	}

	@media print {
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
			max-width: none;
			padding: 0;
		}
		.sheet {
			box-shadow: none;
			break-inside: avoid;
			break-after: page;
		}
		.sheet:last-child {
			break-after: auto;
		}
	}
</style>
