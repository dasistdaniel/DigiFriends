<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Statistik</h1>

<section>
	<h2>Bücher</h2>
	<div class="tiles">
		<div class="tile">
			<span class="tile__num">{data.books.total}</span>
			<span class="tile__label">Bücher gesamt</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.books.open}</span>
			<span class="tile__label">offen</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.books.closed}</span>
			<span class="tile__label">geschlossen</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.books.archived}</span>
			<span class="tile__label">archiviert</span>
		</div>
		<div class="tile" class:tile--warn={data.books.suspended > 0}>
			<span class="tile__num">{data.books.suspended}</span>
			<span class="tile__label">gesperrt</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.books.new7}</span>
			<span class="tile__label">neu (7 Tage)</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.books.new30}</span>
			<span class="tile__label">neu (30 Tage)</span>
		</div>
	</div>
</section>

<section>
	<h2>Einträge</h2>
	<div class="tiles">
		<div class="tile">
			<span class="tile__num">{data.entries.total}</span>
			<span class="tile__label">Einträge gesamt</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.entries.published}</span>
			<span class="tile__label">veröffentlicht</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.entries.pending}</span>
			<span class="tile__label">warten auf Freigabe</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.entries.draft}</span>
			<span class="tile__label">Entwürfe</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.entries.hidden}</span>
			<span class="tile__label">verborgen</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.entries.new7}</span>
			<span class="tile__label">neu (7 Tage)</span>
		</div>
	</div>
</section>

<section>
	<h2>Bilder</h2>
	<div class="tiles">
		<div class="tile">
			<span class="tile__num">{data.assets.total}</span>
			<span class="tile__label">gesamt</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.assets.photos}</span>
			<span class="tile__label">Fotos</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.assets.avatars}</span>
			<span class="tile__label">Avatare</span>
		</div>
		<div class="tile">
			<span class="tile__num">{data.assets.drawings}</span>
			<span class="tile__label">Zeichnungen</span>
		</div>
	</div>
</section>

{#if data.topBooks.length}
	<section>
		<h2>Aktivste Bücher</h2>
		<ol class="top">
			{#each data.topBooks as b (b.title)}
				<li><span class="top__title">{b.title}</span><span class="top__count">{b.count}</span></li>
			{/each}
		</ol>
	</section>
{/if}

<style>
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin: 0.1rem 0 0;
	}
	h2 {
		font-family: var(--font-label);
		font-size: var(--step-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.7rem;
	}
	section {
		margin-top: 1.8rem;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
		gap: 0.7rem;
	}
	.tile {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.8rem 1rem;
	}
	.tile--warn {
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
		background: color-mix(in srgb, var(--danger) 6%, var(--surface));
	}
	.tile__num {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		color: var(--ochre-deep);
	}
	.tile--warn .tile__num {
		color: var(--danger);
	}
	.tile__label {
		font-size: var(--step--1);
		color: var(--ink-500);
	}

	.top {
		list-style: decimal;
		margin: 0;
		padding-left: 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.top li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: var(--step-0);
	}
	.top__count {
		color: var(--ink-500);
		font-variant-numeric: tabular-nums;
	}
</style>
