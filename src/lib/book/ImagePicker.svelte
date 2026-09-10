<script lang="ts">
	type Item = { id: string; thumbUrl: string };

	let {
		token,
		kind,
		variant = 'photos',
		max = 6,
		// eslint-disable-next-line no-useless-assignment -- $bindable-Default, Svelte-Runes
		value = $bindable(variant === 'photos' ? [] : '')
	}: {
		token: string;
		kind: 'avatar' | 'photo' | 'drawing';
		variant?: 'avatar' | 'photos';
		max?: number;
		/** avatar: eine asset-id ('' = keine); photos: Liste von asset-ids */
		value: string | string[];
	} = $props();

	const multiple = $derived(variant === 'photos');
	let items = $state<Item[]>([]);
	let uploading = $state(false);
	let errorMsg = $state('');
	let input: HTMLInputElement | undefined = $state();

	function sync() {
		value = multiple ? items.map((i) => i.id) : (items[0]?.id ?? '');
	}

	async function handleFiles(files: FileList | null) {
		if (!files) return;
		errorMsg = '';
		for (const file of Array.from(files)) {
			if (multiple && items.length >= max) {
				errorMsg = `Höchstens ${max} Fotos.`;
				break;
			}
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
					continue;
				}
				const a = (await res.json()) as Item;
				items = multiple ? [...items, a] : [a];
			} finally {
				uploading = false;
			}
		}
		sync();
		if (input) input.value = '';
	}

	function remove(id: string) {
		items = items.filter((i) => i.id !== id);
		sync();
	}
</script>

<div class="picker picker--{variant}">
	<input
		bind:this={input}
		type="file"
		accept="image/*"
		{multiple}
		class="visually-hidden"
		onchange={(e) => handleFiles((e.currentTarget as HTMLInputElement).files)}
	/>

	{#if variant === 'avatar'}
		<button type="button" class="avatar" onclick={() => input?.click()} disabled={uploading}>
			{#if items[0]}
				<img src={items[0].thumbUrl} alt="Avatar-Vorschau" />
				<span class="avatar__change">ändern</span>
			{:else}
				<span class="avatar__add">{uploading ? '…' : '+ Foto'}</span>
			{/if}
		</button>
		{#if items[0]}
			<button type="button" class="link" onclick={() => remove(items[0].id)}>entfernen</button>
		{/if}
	{:else}
		<div class="grid">
			{#each items as item (item.id)}
				<div class="polaroid">
					<span class="polaroid__frame">
						<img src={item.thumbUrl} alt="Foto-Vorschau" />
					</span>
					<button
						type="button"
						class="polaroid__x"
						onclick={() => remove(item.id)}
						aria-label="Foto entfernen">×</button
					>
				</div>
			{/each}
			{#if items.length < max}
				<button
					type="button"
					class="polaroid polaroid--add"
					onclick={() => input?.click()}
					disabled={uploading}
				>
					{uploading ? '…' : '+'}
				</button>
			{/if}
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
