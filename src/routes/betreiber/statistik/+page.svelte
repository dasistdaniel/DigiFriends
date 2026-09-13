<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/**
	 * Kategorial-Palette (Slots 1–4 der validierten Referenzpalette aus der
	 * dataviz-Skill-Anleitung), in fester Reihenfolge – nicht per Rang zyklisch
	 * neu vergeben. Kontrast gegen das Papier liegt bei den helleren Tönen unter
	 * 3:1 (siehe Skill: "relief required"), deshalb tragen alle Segmente immer
	 * eine sichtbare Text-Legende, nie nur die Farbe.
	 */
	const BLUE = '#2a78d6';
	const ORANGE = '#eb6834';
	const AQUA = '#1baf7a';
	const YELLOW = '#eda100';

	type Seg = { label: string; value: number; color: string };

	const bookSegs = $derived<Seg[]>([
		{ label: 'Offen', value: data.books.open, color: BLUE },
		{ label: 'Geschlossen', value: data.books.closed, color: ORANGE },
		{ label: 'Archiviert', value: data.books.archived, color: AQUA }
	]);
	const entrySegs = $derived<Seg[]>([
		{ label: 'Veröffentlicht', value: data.entries.published, color: BLUE },
		{ label: 'Wartet auf Freigabe', value: data.entries.pending, color: ORANGE },
		{ label: 'Entwurf', value: data.entries.draft, color: AQUA },
		{ label: 'Verborgen', value: data.entries.hidden, color: YELLOW }
	]);
	const assetSegs = $derived<Seg[]>([
		{ label: 'Fotos', value: data.assets.photos, color: BLUE },
		{ label: 'Avatare', value: data.assets.avatars, color: ORANGE },
		{ label: 'Zeichnungen', value: data.assets.drawings, color: AQUA }
	]);

	function sum(segs: Seg[]): number {
		return segs.reduce((s, x) => s + x.value, 0);
	}

	/** CSS conic-gradient mit einer dünnen Papier-Lücke zwischen den Segmenten. */
	function conicStops(segs: Seg[], total: number): string {
		if (total <= 0) return 'conic-gradient(var(--paper-300) 0% 100%)';
		const visible = segs.filter((s) => s.value > 0);
		const gap = visible.length > 1 ? 1.2 : 0;
		const budget = 100 - gap * (visible.length - 1);
		let acc = 0;
		const parts: string[] = [];
		for (const s of visible) {
			const end = acc + (s.value / total) * budget;
			parts.push(`${s.color} ${acc}% ${end}%`);
			acc = end + gap;
		}
		return `conic-gradient(${parts.join(', ')})`;
	}

	function pct(value: number, total: number): number {
		return total > 0 ? Math.round((value / total) * 100) : 0;
	}

	const maxActivity = $derived(Math.max(1, ...data.activity.map((d) => d.count)));
	function formatDay(iso: string): string {
		return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
	}

	const maxTopBook = $derived(Math.max(1, ...data.topBooks.map((b) => b.count)));
</script>

{#snippet donut(title: string, segs: Seg[])}
	{@const total = sum(segs)}
	<div class="chart">
		<h3>{title}</h3>
		<div class="donutrow">
			<div class="donut" style:background={conicStops(segs, total)}>
				<div class="donut__hole">
					<span class="donut__total">{total}</span>
					<span class="donut__totallabel">gesamt</span>
				</div>
			</div>
			<ul class="legend">
				{#each segs as s (s.label)}
					<li title={`${s.label}: ${s.value} (${pct(s.value, total)}%)`}>
						<span class="legend__swatch" style:background={s.color}></span>
						<span class="legend__label">{s.label}</span>
						<span class="legend__value">{s.value}</span>
						<span class="legend__pct">{pct(s.value, total)}%</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/snippet}

{#snippet hbars(title: string, segs: Seg[])}
	{@const total = sum(segs)}
	{@const max = Math.max(1, ...segs.map((s) => s.value))}
	<div class="chart">
		<h3>{title}</h3>
		{#if total === 0}
			<p class="empty">Noch keine Daten.</p>
		{:else}
			<div class="hbars">
				{#each segs as s (s.label)}
					<div class="hbar">
						<span class="hbar__label">{s.label}</span>
						<div class="hbar__track">
							<div
								class="hbar__fill"
								style:width={`${(s.value / max) * 100}%`}
								style:background={s.color}
								title={`${s.label}: ${s.value} (${pct(s.value, total)}%)`}
							></div>
						</div>
						<span class="hbar__value">{s.value}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<h1>Statistik</h1>

<div class="kpis">
	<div class="kpi">
		<span class="kpi__num">{data.books.total}</span>
		<span class="kpi__label">Bücher</span>
	</div>
	<div class="kpi">
		<span class="kpi__num">{data.entries.total}</span>
		<span class="kpi__label">Einträge</span>
	</div>
	<div class="kpi">
		<span class="kpi__num">{data.assets.total}</span>
		<span class="kpi__label">Bilder</span>
	</div>
	<div class="kpi">
		<span class="kpi__num">{data.books.new7}</span>
		<span class="kpi__label">Bücher neu (7 Tage)</span>
	</div>
	<div class="kpi">
		<span class="kpi__num">{data.entries.new7}</span>
		<span class="kpi__label">Einträge neu (7 Tage)</span>
	</div>
	{#if data.books.suspended > 0}
		<div class="kpi kpi--warn" title="Buch/Bücher vom Betreiber gesperrt">
			<span class="kpi__num">⚠ {data.books.suspended}</span>
			<span class="kpi__label">Gesperrt</span>
		</div>
	{/if}
</div>

<div class="grid grid--2">
	{@render donut('Bücher nach Status', bookSegs)}
	{@render donut('Einträge nach Status', entrySegs)}
</div>

<div class="grid grid--2">
	{@render hbars('Bilder nach Art', assetSegs)}

	<div class="chart">
		<h3>Aktivität – neue Einträge (14 Tage)</h3>
		<div class="activity">
			{#each data.activity as d (d.date)}
				<div class="activity__col">
					<div
						class="activity__bar"
						style:height={`${(d.count / maxActivity) * 100}%`}
						title={`${formatDay(d.date)}: ${d.count} Eintrag/Einträge`}
					></div>
				</div>
			{/each}
		</div>
		<div class="activity__axis">
			<span>{formatDay(data.activity[0]?.date ?? '')}</span>
			<span>{formatDay(data.activity[data.activity.length - 1]?.date ?? '')}</span>
		</div>
	</div>
</div>

{#if data.topBooks.length}
	<div class="chart chart--wide">
		<h3>Aktivste Bücher</h3>
		<div class="hbars">
			{#each data.topBooks as b (b.title)}
				<div class="hbar">
					<span class="hbar__label">{b.title}</span>
					<div class="hbar__track">
						<div
							class="hbar__fill"
							style:width={`${(b.count / maxTopBook) * 100}%`}
							style:background="var(--oxblood)"
							title={`${b.title}: ${b.count} veröffentlichte Einträge`}
						></div>
					</div>
					<span class="hbar__value">{b.count}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin: 0.1rem 0 1.2rem;
	}
	h3 {
		font-family: var(--font-label);
		font-size: var(--step--1);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ink-500);
		margin: 0 0 0.9rem;
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
		gap: 0.7rem;
		margin-bottom: 1.6rem;
	}
	.kpi {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.8rem 1rem;
	}
	.kpi--warn {
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
		background: color-mix(in srgb, var(--danger) 6%, var(--surface));
	}
	.kpi__num {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		color: var(--ochre-deep);
	}
	.kpi--warn .kpi__num {
		color: var(--danger);
	}
	.kpi__label {
		font-size: var(--step--1);
		color: var(--ink-500);
	}

	.grid {
		display: grid;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.grid--2 {
		grid-template-columns: 1fr;
	}
	@media (min-width: 760px) {
		.grid--2 {
			grid-template-columns: 1fr 1fr;
		}
	}

	.chart {
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 1rem 1.1rem 1.2rem;
	}
	.chart--wide {
		margin-bottom: 1rem;
	}
	.empty {
		color: var(--ink-300);
		font-size: var(--step--1);
		margin: 0;
	}

	/* Donut */
	.donutrow {
		display: flex;
		align-items: center;
		gap: 1.3rem;
		flex-wrap: wrap;
	}
	.donut {
		position: relative;
		width: 8.5rem;
		height: 8.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.donut__hole {
		position: absolute;
		inset: 22%;
		background: var(--surface);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.donut__total {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		color: var(--ink-900);
		line-height: 1;
	}
	.donut__totallabel {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ink-300);
	}

	.legend {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		flex: 1;
		min-width: 10rem;
	}
	.legend li {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--step--1);
	}
	.legend__swatch {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 2px;
		flex-shrink: 0;
	}
	.legend__label {
		color: var(--ink-700);
	}
	.legend__value {
		font-variant-numeric: tabular-nums;
		color: var(--ink-900);
	}
	.legend__pct {
		font-variant-numeric: tabular-nums;
		color: var(--ink-300);
		min-width: 2.6em;
		text-align: right;
	}

	/* Horizontal bars */
	.hbars {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.hbar {
		display: grid;
		grid-template-columns: minmax(6rem, 11rem) 1fr auto;
		align-items: center;
		gap: 0.6rem;
	}
	.hbar__label {
		font-size: var(--step--1);
		color: var(--ink-700);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.hbar__track {
		background: var(--paper-200);
		border-radius: 4px;
		height: 0.85rem;
		overflow: hidden;
	}
	.hbar__fill {
		height: 100%;
		border-radius: 4px;
		min-width: 3px;
	}
	.hbar__value {
		font-size: var(--step--1);
		font-variant-numeric: tabular-nums;
		color: var(--ink-500);
		min-width: 1.6em;
		text-align: right;
	}

	/* Activity mini bar chart */
	.activity {
		display: flex;
		align-items: flex-end;
		gap: 0.3rem;
		height: 6rem;
	}
	.activity__col {
		flex: 1;
		height: 100%;
		display: flex;
		align-items: flex-end;
	}
	.activity__bar {
		width: 100%;
		min-height: 3px;
		background: var(--oxblood);
		border-radius: 2px 2px 0 0;
	}
	.activity__axis {
		display: flex;
		justify-content: space-between;
		margin-top: 0.4rem;
		font-size: var(--step--1);
		color: var(--ink-300);
	}
</style>
