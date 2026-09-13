<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const token = $derived(data.token);
	const editHref = (id: string) =>
		resolve('/b/[token]/eintrag/[editToken]', { token, editToken: id });

	const queue = $derived(data.locked ? [] : data.queue);
	const entries = $derived(data.locked ? [] : data.entries);

	let confirmDelete = $state<string | null>(null);

	function submitOrder(form: HTMLFormElement) {
		form.requestSubmit();
	}

	function move(index: number, dir: -1 | 1) {
		const ids = entries.map((e) => e.id);
		const j = index + dir;
		if (j < 0 || j >= ids.length) return;
		[ids[index], ids[j]] = [ids[j], ids[index]];
		const input = document.querySelector<HTMLInputElement>('#reorder-order');
		const form = document.querySelector<HTMLFormElement>('#reorder-form');
		if (input && form) {
			input.value = ids.join(',');
			submitOrder(form);
		}
	}

	const stateLabel: Record<string, string> = {
		published: 'Sichtbar',
		hidden: 'Verborgen',
		submitted: 'Wartet',
		draft: 'Entwurf'
	};
</script>

<svelte:head><title>Einträge verwalten</title></svelte:head>

{#if !data.locked}
	{#if queue.length}
		<section class="queue">
			<h2>Warten auf Freigabe <span class="count">{queue.length}</span></h2>
			<ul>
				{#each queue as e (e.id)}
					<li>
						<div class="row__main">
							<strong>{e.displayName}</strong>
							{#if e.preview}<span class="preview">„{e.preview}"</span>{/if}
						</div>
						<div class="row__actions">
							<form method="POST" action="?/publish" use:enhance>
								<input type="hidden" name="id" value={e.id} />
								<button class="btn btn--ok">Freigeben</button>
							</form>
							<a class="btn" href={editHref(e.id)}>Ansehen / Bearbeiten</a>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={e.id} />
								<button class="btn btn--danger">Löschen</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section>
		<h2>Einträge im Buch <span class="count">{entries.length}</span></h2>

		{#if entries.length === 0}
			<p class="empty">Noch keine freigegebenen Einträge.</p>
		{:else}
			<form id="reorder-form" method="POST" action="?/reorder" use:enhance class="visually-hidden">
				<input id="reorder-order" type="hidden" name="order" />
			</form>

			<ul class="list">
				{#each entries as e, i (e.id)}
					<li class="card" class:card--hidden={e.state === 'hidden'}>
						<div class="card__reorder">
							<button
								class="mini"
								type="button"
								onclick={() => move(i, -1)}
								disabled={i === 0}
								aria-label="Nach oben">▲</button
							>
							<button
								class="mini"
								type="button"
								onclick={() => move(i, 1)}
								disabled={i === entries.length - 1}
								aria-label="Nach unten">▼</button
							>
						</div>

						{#if e.avatar}
							<img class="card__avatar" src={e.avatar} alt="" />
						{:else}
							<div class="card__avatar card__avatar--empty" aria-hidden="true"></div>
						{/if}

						<div class="card__body">
							<div class="card__head">
								<strong>{e.displayName}</strong>
								<span class="pill pill--{e.state}">{stateLabel[e.state]}</span>
								{#if e.photoCount}<span class="muted">{e.photoCount} Foto(s)</span>{/if}
								{#if e.drawingCount}<span class="muted">{e.drawingCount} Zeichnung(en)</span>{/if}
							</div>
							{#if e.preview}<p class="preview">„{e.preview}"</p>{/if}
						</div>

						<div class="card__actions">
							<a class="btn" href={editHref(e.id)}>Bearbeiten</a>
							{#if e.state === 'published'}
								<form method="POST" action="?/hide" use:enhance>
									<input type="hidden" name="id" value={e.id} />
									<button class="btn">Verbergen</button>
								</form>
							{:else}
								<form method="POST" action="?/unhide" use:enhance>
									<input type="hidden" name="id" value={e.id} />
									<button class="btn">Einblenden</button>
								</form>
							{/if}

							{#if confirmDelete === e.id}
								<form
									method="POST"
									action="?/delete"
									use:enhance={() => {
										return async ({ update }) => {
											confirmDelete = null;
											await update();
										};
									}}
								>
									<input type="hidden" name="id" value={e.id} />
									<button class="btn btn--danger">Wirklich löschen</button>
								</form>
								<button class="btn" type="button" onclick={() => (confirmDelete = null)}>
									Abbrechen
								</button>
							{:else}
								<button
									class="btn btn--danger"
									type="button"
									onclick={() => (confirmDelete = e.id)}
								>
									Löschen
								</button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}

<style>
	section {
		margin-bottom: 2.5rem;
	}
	h2 {
		font-family: var(--font-label);
		font-size: var(--step-1);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 1rem;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.count {
		font-size: var(--step--1);
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 999px;
		padding: 0.05rem 0.5rem;
		color: var(--ink-500);
	}
	.empty {
		color: var(--ink-300);
	}

	.queue {
		background: color-mix(in srgb, var(--ochre) 10%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--ochre) 35%, var(--surface-line));
		border-radius: 8px;
		padding: 1.1rem 1.2rem;
	}
	.queue ul,
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.queue li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding: 0.5rem 0;
		border-top: 1px solid color-mix(in srgb, var(--ochre) 20%, transparent);
	}
	.queue li:first-child {
		border-top: 0;
	}

	.card {
		display: grid;
		grid-template-columns: auto auto 1fr auto;
		gap: 0.9rem;
		align-items: center;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.8rem 1rem;
	}
	.card--hidden {
		opacity: 0.6;
	}
	.card__reorder {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.mini {
		width: 1.5rem;
		height: 1.2rem;
		font-size: 0.6rem;
		line-height: 1;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 3px;
		cursor: pointer;
		color: var(--ink-500);
	}
	.mini:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.card__avatar {
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 50%;
		object-fit: cover;
	}
	.card__avatar--empty {
		background: var(--paper-300);
	}
	.card__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.card__body {
		min-width: 0;
	}
	.preview {
		font-family: var(--font-hand);
		color: var(--ink-500);
		font-size: var(--step-0);
		margin: 0.2rem 0 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.muted {
		font-size: var(--step--1);
		color: var(--ink-300);
	}

	.pill {
		font-family: var(--font-label);
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		border: 1px solid var(--surface-line);
	}
	.pill--published {
		color: var(--ok);
		border-color: color-mix(in srgb, var(--ok) 40%, var(--surface-line));
	}
	.pill--hidden {
		color: var(--ink-400, var(--ink-500));
	}
	.pill--submitted,
	.pill--draft {
		color: var(--ochre-deep);
		border-color: color-mix(in srgb, var(--ochre) 40%, var(--surface-line));
	}

	.card__actions,
	.row__actions {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
		align-items: center;
	}
	.card__actions form,
	.row__actions form {
		display: contents;
	}
	.btn {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		color: var(--ink-700);
		border-radius: 999px;
		padding: 0.35rem 0.8rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}
	.btn--ok {
		background: var(--oxblood);
		color: var(--paper-100);
		border-color: var(--oxblood);
	}
	.btn--danger {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
	}

	@media (max-width: 620px) {
		.card {
			grid-template-columns: auto 1fr;
			grid-template-areas:
				'reorder body'
				'actions actions';
		}
		.card__reorder {
			grid-area: reorder;
			flex-direction: row;
		}
		.card__avatar {
			display: none;
		}
		.card__body {
			grid-area: body;
		}
		.card__actions {
			grid-area: actions;
		}
	}
</style>
