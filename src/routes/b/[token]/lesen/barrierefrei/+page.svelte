<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import AccessibleReading from '$lib/book/AccessibleReading.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const book = $derived(data.locked ? null : data.book);
	const entries = $derived(data.locked ? [] : data.entries);

	const backHref = $derived(resolve('/b/[token]/lesen', { token: page.params.token! }));
</script>

<svelte:head>
	<title>{book?.title ?? 'Freundebuch'} – Barrierefreier Text</title>
</svelte:head>

{#if book}
	<div class="toolbar">
		<a href={backHref}>← Zurück zum Buch</a>
		<p class="toolbar__hint">
			Einfacher, durchgehender Text ohne Animation – für Screenreader, Tastatur-Navigation oder zum
			Drucken.
		</p>
		<button type="button" onclick={() => window.print()}>Drucken / Als PDF speichern</button>
	</div>

	<main>
		<AccessibleReading {book} {entries} />
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

	@media print {
		/* !important: position:fixed-Elemente (Footer) werden von Browsern beim
		   Drucken sonst auf JEDER Seite wiederholt - display:none muss hier
		   garantiert gewinnen, unabhaengig von der CSS-Ladereihenfolge. */
		:global(.site-footer) {
			display: none !important;
		}
		:global(body) {
			background: #fff !important;
			padding-bottom: 0 !important;
		}
		.toolbar {
			display: none !important;
		}
		main :global(.doc) {
			max-width: none;
			padding: 0;
			background: #fff;
		}
		main :global(.cover) {
			border-bottom: 0;
			break-after: page;
		}
		main :global(.entry) {
			border-bottom: 0;
			break-inside: avoid;
			break-after: page;
		}
		main :global(.entry:last-child) {
			break-after: auto;
		}
		@page {
			margin: 1.6cm;
		}
	}
</style>
