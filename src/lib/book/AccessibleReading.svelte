<script lang="ts">
	type Answer = { label: string; value: string };
	type Pic = { id: string; thumb: string; full: string };
	type Entry = {
		id: string;
		displayName: string;
		closingLine: string | null;
		leftAnswers: Answer[];
		rightAnswers: Answer[];
		avatar: { thumb: string } | null;
		drawings: Pic[];
		photos: Pic[];
	};

	let {
		book,
		entries
	}: {
		book: { title: string; subtitle?: string | null; introText?: string | null };
		entries: Entry[];
	} = $props();
</script>

<!--
	Lineares, rein sequenzielles Markup ohne Animation oder ortsgebundene
	Navigation - Alternative zur interaktiven Blätteransicht (Book.svelte),
	die auf einem festen zweiseitigen Layout mit Seitenumblätter-Animation
	beruht und dadurch für Screenreader und Tastatur-Navigation schwerer
	zugänglich ist. Bewusst normale Lese-Schrift statt der dekorativen
	Handschrift-Schrift für Antworttexte (bessere Lesbarkeit).
-->
<div class="doc">
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
							<dd>{a.value}</dd>
						</div>
					{/each}
				</dl>

				<p class="entry__closing">{e.closingLine || `Alles Liebe, ${e.displayName}`}</p>
			</article>
		{/each}
	{/if}
</div>

<style>
	.doc {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2.5rem 16px 4rem;
		background: var(--surface);
		color: var(--ink-900);
		font-size: 1.08em;
		line-height: 1.6;
	}
	.cover {
		text-align: center;
		padding: 2rem 0 2.2rem;
		border-bottom: 1px solid var(--surface-line);
	}
	.cover h1 {
		font-family: var(--font-body);
		font-size: var(--step-3);
		font-weight: 700;
		color: var(--ink-900);
	}
	.cover__sub {
		color: var(--ink-700);
		margin-top: 0.3rem;
	}
	.empty {
		text-align: center;
		color: var(--ink-700);
	}

	.entry {
		padding: 2rem 0;
		border-bottom: 1px solid var(--surface-line);
	}
	.entry:last-child {
		border-bottom: 0;
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
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--step-2);
		color: var(--ink-900);
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
		border-radius: 3px;
	}

	.qa {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.qa dt {
		font-family: var(--font-label);
		font-size: var(--step-0);
		font-weight: 600;
		letter-spacing: 0.03em;
		color: var(--ink-700);
	}
	.qa dd {
		margin: 0.25rem 0 0;
		font-size: 1.1em;
		line-height: 1.55;
		color: var(--ink-900);
		white-space: pre-wrap;
	}
	.entry__closing {
		margin-top: 1.3rem;
		font-size: 1.1em;
		font-style: italic;
		color: var(--ink-900);
	}
</style>
