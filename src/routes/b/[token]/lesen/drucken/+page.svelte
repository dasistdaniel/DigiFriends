<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const book = $derived(data.locked ? null : data.book);
	const entries = $derived(data.locked ? [] : data.entries);

	const backHref = $derived(resolve('/b/[token]/lesen', { token: page.params.token! }));
</script>

<svelte:head>
	<title>{book?.title ?? 'Freundebuch'} – Druckansicht</title>
</svelte:head>

{#if book}
	<div class="toolbar">
		<a href={backHref}>← Zurück zum Buch</a>
		<button type="button" onclick={() => window.print()}>Drucken / Als PDF speichern</button>
	</div>

	<main class="doc">
		<section class="cover">
			<h1>{book.title}</h1>
			{#if book.subtitle}<p class="cover__sub">{book.subtitle}</p>{/if}
			{#if book.introText}
				{#each book.introText.split(/\n{2,}/) as para (para)}
					<p>{para}</p>
				{/each}
			{/if}
		</section>

		{#if entries.length === 0}
			<p class="empty">Noch keine veröffentlichten Einträge.</p>
		{:else}
			{#each entries as e (e.id)}
				<article class="entry">
					<header class="entry__head">
						{#if e.avatar}
							<img class="entry__avatar" src={e.avatar.thumb} alt={`Foto von ${e.displayName}`} />
						{/if}
						<h2>{e.displayName}</h2>
					</header>

					{#if e.photos.length || e.drawings.length}
						<div class="photos">
							{#each e.photos as p (p.id)}
								<img src={p.thumb} alt={`Foto zum Eintrag von ${e.displayName}`} />
							{/each}
							{#each e.drawings as d (d.id)}
								<img src={d.thumb} alt={`Zeichnung von ${e.displayName}`} />
							{/each}
						</div>
					{/if}

					<dl class="qa">
						{#each [...e.leftAnswers, ...e.rightAnswers] as a (a.label)}
							<div>
								<dt>{a.label}</dt>
								<dd class="hand">{a.value}</dd>
							</div>
						{/each}
					</dl>

					<p class="entry__closing hand">{e.closingLine || `Alles Liebe, ${e.displayName}`}</p>
				</article>
			{/each}
		{/if}
	</main>
{/if}

<style>
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 16px;
		background: var(--surface);
		border-bottom: 1px solid var(--surface-line);
		font-family: var(--font-label);
		font-size: var(--step--1);
	}
	.toolbar a {
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

	.doc {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2.5rem 16px 4rem;
		background: var(--surface);
	}
	.cover {
		text-align: center;
		padding: 3rem 0 2.5rem;
	}
	.cover h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		color: var(--ochre-deep);
	}
	.cover__sub {
		color: var(--ink-500);
		margin-top: 0.2rem;
	}
	.empty {
		text-align: center;
		color: var(--ink-300);
	}

	.entry {
		padding: 2rem 0;
		border-top: 1px solid var(--surface-line);
	}
	.entry__head {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.entry__avatar {
		width: 3.6rem;
		height: 3.6rem;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}
	.entry__head h2 {
		font-family: var(--font-hand);
		font-size: var(--step-2);
	}

	.photos {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-bottom: 1.2rem;
	}
	.photos img {
		width: 6.5rem;
		height: 7.2rem;
		object-fit: cover;
		border: 1px solid var(--paper-edge);
	}

	.qa {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.qa dt {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.06em;
		color: var(--ink-500);
	}
	.qa dd {
		margin: 0.15rem 0 0;
		font-size: var(--step-1);
		line-height: 1.35;
		color: var(--ink-900);
		white-space: pre-wrap;
	}
	.entry__closing {
		margin-top: 1.2rem;
		text-align: right;
		font-size: var(--step-1);
		color: var(--ink-700);
	}

	@media print {
		:global(body) {
			background: #fff;
			padding-bottom: 0;
		}
		:global(.site-footer) {
			display: none;
		}
		.toolbar {
			display: none;
		}
		.doc {
			max-width: none;
			padding: 0;
			background: #fff;
		}
		.cover {
			break-after: page;
		}
		.entry {
			border-top: 0;
			break-inside: avoid;
			break-after: page;
		}
		.entry:last-child {
			break-after: auto;
		}
		@page {
			margin: 1.6cm;
		}
	}
</style>
