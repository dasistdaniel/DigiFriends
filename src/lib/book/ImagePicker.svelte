<script lang="ts">
	import { untrack } from 'svelte';

	type Item = { id: string; thumbUrl: string };

	let {
		token,
		kind,
		variant = 'photos',
		max = 4,
		initial = [],
		// eslint-disable-next-line no-useless-assignment -- $bindable-Default, Svelte-Runes
		value = $bindable(variant === 'photos' ? [] : '')
	}: {
		token: string;
		kind: 'avatar' | 'photo' | 'drawing';
		variant?: 'avatar' | 'photos';
		max?: number;
		/** bereits vorhandene Bilder (beim Bearbeiten) */
		initial?: Item[];
		/** avatar: eine asset-id ('' = keine); photos: Liste von asset-ids */
		value: string | string[];
	} = $props();

	const multiple = $derived(variant === 'photos');
	/** Feste Anzahl Plaetze (avatar: immer genau einer), Reihenfolge bleibt stabil -
	 * ein entferntes Bild hinterlaesst eine Luecke an derselben Stelle statt dass
	 * die uebrigen nachruecken, damit die UI beim Befuellen nicht "springt". */
	const slotCount = $derived(variant === 'avatar' ? 1 : max);
	let slots = $state<(Item | null)[]>(
		untrack(() => {
			const arr: (Item | null)[] = Array(slotCount).fill(null);
			initial.slice(0, slotCount).forEach((item, i) => (arr[i] = item));
			return arr;
		})
	);
	let targetIndex = $state<number | null>(null);
	let uploading = $state(false);
	let errorMsg = $state('');
	let input: HTMLInputElement | undefined = $state();

	function sync() {
		const filled = slots.filter((s): s is Item => s !== null);
		value = multiple ? filled.map((i) => i.id) : (filled[0]?.id ?? '');
	}

	function openSlot(i: number) {
		if (uploading) return;
		errorMsg = '';
		targetIndex = i;
		input?.click();
	}

	async function handleFiles(files: FileList | null) {
		const file = files?.[0];
		const i = targetIndex;
		if (!file || i === null) return;

		errorMsg = '';
		uploading = true;
		try {
			const fd = new FormData();
			fd.set('file', file);
			fd.set('kind', kind);
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
			slots = slots.map((s, idx) => (idx === i ? a : s));
			sync();
		} finally {
			uploading = false;
			targetIndex = null;
			if (input) input.value = '';
		}
	}

	function remove(i: number) {
		slots = slots.map((s, idx) => (idx === i ? null : s));
		sync();
	}
</script>

<div class="picker picker--{variant}">
	<input
		bind:this={input}
		type="file"
		accept="image/*"
		class="visually-hidden"
		onchange={(e) => handleFiles((e.currentTarget as HTMLInputElement).files)}
	/>

	{#if variant === 'avatar'}
		<button type="button" class="avatar" onclick={() => openSlot(0)} disabled={uploading}>
			{#if slots[0]}
				<img src={slots[0].thumbUrl} alt="Avatar-Vorschau" />
				<span class="avatar__change">ändern</span>
			{:else}
				<span class="avatar__add">{uploading ? '…' : '+ Foto'}</span>
			{/if}
		</button>
		{#if slots[0]}
			<button type="button" class="link" onclick={() => remove(0)}>entfernen</button>
		{/if}
	{:else}
		<div class="grid">
			{#each slots as slot, i (i)}
				{#if slot}
					<div class="polaroid">
						<span class="polaroid__frame">
							<img src={slot.thumbUrl} alt="Foto-Vorschau" />
						</span>
						<button
							type="button"
							class="polaroid__x"
							onclick={() => remove(i)}
							aria-label="Foto entfernen">×</button
						>
					</div>
				{:else}
					<button
						type="button"
						class="polaroid polaroid--add"
						onclick={() => openSlot(i)}
						disabled={uploading}
					>
						{uploading && targetIndex === i ? '…' : '+'}
					</button>
				{/if}
			{/each}
		</div>
	{/if}

	{#if errorMsg}<p class="err">{errorMsg}</p>{/if}
</div>

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.picker--avatar {
		flex-direction: row;
		align-items: center;
	}

	.avatar {
		width: 5.5rem;
		height: 5.5rem;
		border-radius: 50%;
		border: 2px dashed var(--paper-line);
		background: color-mix(in srgb, var(--paper-100) 60%, transparent);
		display: grid;
		place-items: center;
		cursor: pointer;
		overflow: hidden;
		padding: 0;
		position: relative;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.avatar__add {
		font-family: var(--font-label);
		font-size: var(--step--1);
		color: var(--ink-500);
	}
	.avatar__change {
		position: absolute;
		inset: auto 0 0 0;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		font-size: 0.7rem;
		padding: 0.1rem 0;
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
	}
	.polaroid__frame img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.polaroid--add {
		display: grid;
		place-items: center;
		border-style: dashed;
		cursor: pointer;
		font-size: 1.4rem;
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

	.link {
		background: none;
		border: 0;
		color: var(--ochre-deep);
		font-size: var(--step--1);
		cursor: pointer;
		padding: 0;
	}
	.err {
		color: var(--danger);
		font-size: var(--step--1);
		margin: 0;
	}
</style>
