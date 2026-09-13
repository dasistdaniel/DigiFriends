<script lang="ts">
	import { untrack } from 'svelte';

	type Item = { id: string; thumbUrl: string; url: string };
	type Tool = 'draw' | 'erase' | 'fill';

	let {
		token,
		max = 4,
		initial = [],
		// eslint-disable-next-line no-useless-assignment -- $bindable-Default, Svelte-Runes
		value = $bindable([])
	}: {
		token: string;
		max?: number;
		/** bereits vorhandene Zeichnungen (beim Bearbeiten) */
		initial?: Item[];
		/** asset-ids der Zeichnungen */
		value?: string[];
	} = $props();

	const CW = 560;
	const CH = 392;
	const SWATCHES = [
		'#2c2620',
		'#6e2f2a',
		'#a9762c',
		'#6f7d5f',
		'#7a4a30',
		'#2f5f8a',
		'#a13d63',
		'#000000'
	];

	let items = $state<Item[]>(untrack(() => [...initial]));
	let open = $state(false);
	/** null = neue Zeichnung anlegen; sonst Index in items, der bearbeitet wird */
	let editingIndex = $state<number | null>(null);
	let color = $state(SWATCHES[0]);
	let size = $state(4);
	let tool = $state<Tool>('draw');
	let uploading = $state(false);
	let errorMsg = $state('');
	let limitMsg = $state('');

	let canvas: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | null = null;
	let history: ImageData[] = [];
	let isDrawing = false;

	function sync() {
		value = items.map((i) => i.id);
	}

	function initCanvas() {
		if (!canvas) return;
		ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, CW, CH);
		history = [];
	}

	$effect(() => {
		if (!open || !canvas) return;
		initCanvas();
		const existing = editingIndex !== null ? items[editingIndex] : undefined;
		if (existing) {
			const img = new Image();
			img.onload = () => ctx?.drawImage(img, 0, 0, CW, CH);
			img.src = existing.url;
		}
	});

	function openNew() {
		if (items.length >= max) {
			limitMsg = `Höchstens ${max} Zeichnungen.`;
			return;
		}
		limitMsg = '';
		errorMsg = '';
		tool = 'draw';
		editingIndex = null;
		open = true;
	}
	function openEdit(i: number) {
		errorMsg = '';
		tool = 'draw';
		editingIndex = i;
		open = true;
	}
	function close() {
		open = false;
	}

	function toLocal(e: PointerEvent): { x: number; y: number } {
		const rect = canvas!.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) * (CW / rect.width),
			y: (e.clientY - rect.top) * (CH / rect.height)
		};
	}

	function pushHistory() {
		if (!ctx) return;
		history.push(ctx.getImageData(0, 0, CW, CH));
		if (history.length > 30) history.shift();
	}

	function hexToRgba(hex: string): [number, number, number, number] {
		const n = parseInt(hex.slice(1), 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
	}

	function floodFill(startX: number, startY: number, fillHex: string) {
		if (!ctx) return;
		const x0 = Math.round(startX);
		const y0 = Math.round(startY);
		if (x0 < 0 || y0 < 0 || x0 >= CW || y0 >= CH) return;

		const img = ctx.getImageData(0, 0, CW, CH);
		const data = img.data;
		const fill = hexToRgba(fillHex);
		const startIdx = (y0 * CW + x0) * 4;
		const target: [number, number, number, number] = [
			data[startIdx],
			data[startIdx + 1],
			data[startIdx + 2],
			data[startIdx + 3]
		];
		if (
			target[0] === fill[0] &&
			target[1] === fill[1] &&
			target[2] === fill[2] &&
			target[3] === fill[3]
		) {
			return;
		}

		const tolerance = 32;
		const matches = (i: number) =>
			Math.abs(data[i] - target[0]) <= tolerance &&
			Math.abs(data[i + 1] - target[1]) <= tolerance &&
			Math.abs(data[i + 2] - target[2]) <= tolerance &&
			Math.abs(data[i + 3] - target[3]) <= tolerance;

		const visited = new Uint8Array(CW * CH);
		const stack: number[] = [x0, y0];
		while (stack.length) {
			const y = stack.pop()!;
			const x = stack.pop()!;
			const px = y * CW + x;
			if (visited[px]) continue;
			const i = px * 4;
			if (!matches(i)) continue;
			visited[px] = 1;
			data[i] = fill[0];
			data[i + 1] = fill[1];
			data[i + 2] = fill[2];
			data[i + 3] = fill[3];
			if (x > 0) stack.push(x - 1, y);
			if (x < CW - 1) stack.push(x + 1, y);
			if (y > 0) stack.push(x, y - 1);
			if (y < CH - 1) stack.push(x, y + 1);
		}
		ctx.putImageData(img, 0, 0);
	}

	function pointerDown(e: PointerEvent) {
		if (!ctx || !canvas) return;
		const { x, y } = toLocal(e);
		if (tool === 'fill') {
			pushHistory();
			floodFill(x, y, color);
			return;
		}
		canvas.setPointerCapture(e.pointerId);
		pushHistory();
		isDrawing = true;
		ctx.beginPath();
		ctx.moveTo(x, y);
	}
	function pointerMove(e: PointerEvent) {
		if (!isDrawing || !ctx) return;
		const { x, y } = toLocal(e);
		ctx.strokeStyle = tool === 'erase' ? '#ffffff' : color;
		ctx.lineWidth = size;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineTo(x, y);
		ctx.stroke();
	}
	function pointerUp() {
		isDrawing = false;
	}

	function undo() {
		if (!ctx || history.length === 0) return;
		ctx.putImageData(history.pop()!, 0, 0);
	}
	function clearAll() {
		if (!ctx) return;
		pushHistory();
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, CW, CH);
	}
	function pickColor(c: string) {
		color = c;
		if (tool === 'erase') tool = 'draw';
	}
	function remove(i: number) {
		items = items.filter((_, idx) => idx !== i);
		sync();
	}

	async function save() {
		if (!canvas) return;
		uploading = true;
		errorMsg = '';
		try {
			const blob = await new Promise<Blob | null>((res) => canvas!.toBlob(res, 'image/png'));
			if (!blob) {
				errorMsg = 'Zeichnung konnte nicht gespeichert werden.';
				return;
			}
			const fd = new FormData();
			fd.set('file', new File([blob], 'zeichnung.png', { type: 'image/png' }));
			fd.set('kind', 'drawing');
			const res = await fetch(`/b/${token}/upload`, {
				method: 'POST',
				body: fd,
				headers: { accept: 'application/json' }
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				errorMsg = body.message ?? 'Upload fehlgeschlagen.';
				return;
			}
			const a = (await res.json()) as Item;
			if (editingIndex !== null) {
				items = items.map((it, idx) => (idx === editingIndex ? a : it));
			} else {
				items = [...items, a];
			}
			sync();
			open = false;
		} finally {
			uploading = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (open && e.key === 'Escape') close();
	}}
/>

<div class="picker">
	<div class="grid">
		{#each items as item, i (item.id)}
			<div class="polaroid">
				<button
					type="button"
					class="polaroid__frame"
					onclick={() => openEdit(i)}
					aria-label="Zeichnung bearbeiten"
				>
					<img src={item.thumbUrl} alt="Zeichnung-Vorschau" />
				</button>
				<button
					type="button"
					class="polaroid__x"
					onclick={() => remove(i)}
					aria-label="Zeichnung entfernen">×</button
				>
			</div>
		{/each}
		{#if items.length < max}
			<button type="button" class="polaroid polaroid--add" onclick={openNew}>+ Zeichnen</button>
		{/if}
	</div>
	{#if limitMsg}<p class="err">{limitMsg}</p>{/if}
</div>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="overlay" onclick={(e) => e.currentTarget === e.target && close()}>
		<div class="tool">
			<canvas
				bind:this={canvas}
				width={CW}
				height={CH}
				class="canvas"
				class:canvas--fill={tool === 'fill'}
				onpointerdown={pointerDown}
				onpointermove={pointerMove}
				onpointerup={pointerUp}
				onpointerleave={pointerUp}
			></canvas>

			<div class="toolbar">
				<div class="group">
					{#each SWATCHES as c (c)}
						<button
							type="button"
							class="swatch"
							class:swatch--on={tool !== 'erase' && color === c}
							style:background={c}
							onclick={() => pickColor(c)}
							aria-label={`Farbe ${c}`}
						></button>
					{/each}
					<input
						type="color"
						bind:value={color}
						onclick={() => pickColor(color)}
						class="colorpick"
						aria-label="Eigene Farbe"
					/>
				</div>
				<div class="group">
					{#each [3, 6, 12] as s (s)}
						<button
							type="button"
							class="size"
							class:size--on={size === s}
							onclick={() => (size = s)}
							aria-label={`Stiftstärke ${s}`}
						>
							<span style:width="{s}px" style:height="{s}px"></span>
						</button>
					{/each}
				</div>
				<div class="group">
					<button
						type="button"
						class="pill"
						class:pill--on={tool === 'fill'}
						onclick={() => (tool = tool === 'fill' ? 'draw' : 'fill')}
					>
						Füllen
					</button>
					<button
						type="button"
						class="pill"
						class:pill--on={tool === 'erase'}
						onclick={() => (tool = tool === 'erase' ? 'draw' : 'erase')}
					>
						Radierer
					</button>
					<button type="button" class="pill" onclick={undo}>Rückgängig</button>
					<button type="button" class="pill" onclick={clearAll}>Alles löschen</button>
				</div>
			</div>

			{#if errorMsg}<p class="err">{errorMsg}</p>{/if}

			<div class="actions">
				<button type="button" class="btn" onclick={close}>Abbrechen</button>
				<button type="button" class="btn btn--primary" onclick={save} disabled={uploading}>
					{uploading ? 'Speichert …' : 'Übernehmen'}
				</button>
			</div>
		</div>
		<button type="button" class="overlay__x" onclick={close} aria-label="Schließen">×</button>
	</div>
{/if}

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	.polaroid {
		width: 5rem;
		height: 5.8rem;
		background: #fffdf6;
		border: 1px solid var(--paper-edge);
		box-shadow: 0 6px 14px -8px var(--shadow-page);
		padding: 0.3rem 0.3rem 1rem;
		position: relative;
	}
	.polaroid__frame {
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--paper-300);
		border: 0;
		padding: 0;
		cursor: pointer;
	}
	.polaroid__frame img {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 0;
		object-fit: cover;
	}
	.polaroid--add {
		display: grid;
		place-items: center;
		border-style: dashed;
		cursor: pointer;
		font-family: var(--font-label);
		font-size: var(--step--2, 0.75rem);
		color: var(--ink-300);
		padding-bottom: 0.3rem;
	}
	.polaroid__x {
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 50%;
		border: 1px solid var(--surface-line);
		background: var(--surface);
		color: var(--ink-700);
		font-size: 0.9rem;
		line-height: 1;
		cursor: pointer;
	}

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(20, 12, 6, 0.86);
		display: grid;
		place-items: center;
		padding: 16px;
	}
	.tool {
		width: min(100%, 40rem);
		background: var(--surface);
		border-radius: 10px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
	}
	.canvas {
		width: 100%;
		aspect-ratio: 560 / 392;
		background: #fff;
		border-radius: 6px;
		border: 1px solid var(--surface-line);
		touch-action: none;
		cursor: crosshair;
	}
	.canvas--fill {
		cursor: pointer;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		align-items: center;
	}
	.group {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		flex-wrap: wrap;
	}
	.swatch {
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
	}
	.swatch--on {
		border-color: var(--ink-700);
	}
	.colorpick {
		width: 1.6rem;
		height: 1.6rem;
		padding: 0;
		border: 1px solid var(--surface-line);
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		background: none;
	}
	.size {
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 50%;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		display: grid;
		place-items: center;
		cursor: pointer;
	}
	.size--on {
		border-color: var(--oxblood);
	}
	.size span {
		display: block;
		border-radius: 50%;
		background: var(--ink-900);
	}
	.pill {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		color: var(--ink-700);
		border-radius: 999px;
		padding: 0.3rem 0.75rem;
		cursor: pointer;
	}
	.pill--on {
		background: var(--oxblood);
		color: var(--paper-100);
		border-color: var(--oxblood);
	}
	.err {
		color: var(--danger);
		font-size: var(--step--1);
		margin: 0;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
	}
	.btn {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		color: var(--ink-700);
		border-radius: 999px;
		padding: 0.5rem 1.1rem;
		cursor: pointer;
	}
	.btn--primary {
		background: var(--oxblood);
		color: var(--paper-100);
		border-color: var(--oxblood);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.overlay__x {
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
