<script lang="ts">
	import BookPage from './BookPage.svelte';

	type Answer = { label: string; value: string };
	type Pic = { id: string; thumb: string; rotate: number };
	type Entry = {
		displayName: string;
		closingLine: string | null;
		leftAnswers: Answer[];
		rightAnswers: Answer[];
		avatar: { thumb: string } | null;
		drawings: Pic[];
		photos: Pic[];
	};

	let {
		entry,
		theme,
		readableFont = false
	}: {
		entry: Entry;
		theme?: string;
		/** normale Lese-Schrift statt der dekorativen Handschrift für Name/Antworten/Grußformel
		 * (barrierefreie Ansicht) - Struktur/Design bleiben sonst identisch zum PDF-Export. */
		readableFont?: boolean;
	} = $props();
</script>

<BookPage side="left" {theme} plain>
	<div class="entry" class:entry--readable={readableFont}>
		<div class="entry__head">
			<p class="entry__from label">
				Eintrag von: <span class="hand">{entry.displayName}</span>
			</p>
			{#if entry.avatar}
				<img class="entry__avatar" src={entry.avatar.thumb} alt={`Foto von ${entry.displayName}`} />
			{/if}
		</div>
		<dl class="entry__qa">
			{#each entry.leftAnswers as a (a.label)}
				<div>
					<dt class="label">{a.label}</dt>
					<dd class="hand">{a.value}</dd>
				</div>
			{/each}
		</dl>
	</div>
</BookPage>
<BookPage side="right" {theme} plain>
	<div class="entry" class:entry--readable={readableFont}>
		{#if entry.drawings.length || entry.photos.length}
			<div class="polaroids">
				{#each entry.drawings as drawing (drawing.id)}
					<span class="polaroid" style="--rot: {drawing.rotate}deg">
						<img src={drawing.thumb} alt={`Zeichnung von ${entry.displayName}`} />
					</span>
				{/each}
				{#each entry.photos as photo (photo.id)}
					<span class="polaroid" style="--rot: {photo.rotate}deg">
						<img src={photo.thumb} alt={`Foto zum Eintrag von ${entry.displayName}`} />
					</span>
				{/each}
			</div>
		{/if}
		<dl class="entry__qa">
			{#each entry.rightAnswers as a (a.label)}
				<div>
					<dt class="label">{a.label}</dt>
					<dd class="hand">{a.value}</dd>
				</div>
			{/each}
		</dl>
		<p class="entry__closing hand">
			{entry.closingLine || `Alles Liebe, ${entry.displayName}`}
		</p>
	</div>
</BookPage>

<style>
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

	/* Barrierefreie Ansicht: normale, gut lesbare Schrift statt der
	   dekorativen Handschrift, und etwas kontrastreichere Labels. */
	.entry--readable :global(.hand) {
		font-family: var(--font-body);
	}
	.entry--readable .entry__qa dt {
		color: var(--ink-700);
	}
	.entry--readable .entry__qa dd {
		font-size: 1.05em;
		line-height: 1.55;
	}
</style>
