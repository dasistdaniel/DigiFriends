<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const books = $derived(data.books);
	const message = $derived(form && 'message' in form ? form.message : undefined);

	let confirmDelete = $state<string | null>(null);
	let query = $state('');
	let onlyInactive = $state(false);
	const filtered = $derived(
		books
			.filter((b) => !query.trim() || b.title.toLowerCase().includes(query.trim().toLowerCase()))
			.filter((b) => !onlyInactive || b.inactive)
	);

	const statusLabel: Record<string, string> = {
		open: 'offen',
		closed: 'geschlossen',
		archived: 'archiviert'
	};

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function timeAgo(iso: string): string {
		const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
		if (days < 1) return 'heute';
		if (days < 30) return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
		if (days < 365) {
			const months = Math.round(days / 30);
			return `vor ${months} Monat${months === 1 ? '' : 'en'}`;
		}
		const years = Math.round(days / 365);
		return `vor ${years} Jahr${years === 1 ? '' : 'en'}`;
	}
</script>

{#if !data.enabled}
	<main class="center">
		<section class="card">
			<p class="hint">
				Der Betreiber-Bereich ist nicht konfiguriert. Setze <code>OPERATOR_PASSWORD</code> in der Umgebung,
				um ihn zu aktivieren.
			</p>
		</section>
	</main>
{:else if !data.authenticated}
	<main class="center">
		<section class="card gate">
			<h1>Betreiber-Bereich</h1>
			<p>Zugang nur mit dem Betreiber-Passwort.</p>
			<form method="POST" action="?/login" use:enhance>
				<label>
					<span class="visually-hidden">Passwort</span>
					<input
						name="password"
						type="password"
						required
						autocomplete="current-password"
						placeholder="Passwort"
					/>
				</label>
				{#if message}<p class="err">{message}</p>{/if}
				<button type="submit">Anmelden</button>
			</form>
		</section>
	</main>
{:else}
	<div class="head">
		<h1>Bücher <span class="count">{books.length}</span></h1>
		<div class="head__controls">
			<label class="check">
				<input type="checkbox" bind:checked={onlyInactive} />
				Nur inaktive
			</label>
			<input class="search" type="search" placeholder="Titel suchen…" bind:value={query} />
		</div>
	</div>

	{#if filtered.length === 0}
		<p class="hint">Keine Bücher gefunden.</p>
	{:else}
		<ul class="list">
			{#each filtered as b (b.id)}
				<li class="row" class:row--suspended={b.suspended}>
					<div class="row__main">
						<strong>{b.title}</strong>
						<span class="meta">
							angelegt {formatDate(b.createdAt)} · {statusLabel[b.status] ?? b.status} · {b.publishedCount}/{b.entryCount}
							Einträge veröffentlicht · zuletzt aktiv {timeAgo(b.lastActivityAt)}
						</span>
						<div class="badges">
							{#if b.suspended}<span class="badge">Gesperrt</span>{/if}
							{#if b.inactive}<span class="badge badge--inactive">Inaktiv</span>{/if}
						</div>
					</div>
					<div class="row__actions">
						<a class="btn" href={resolve('/betreiber/[bookId]', { bookId: b.id })}>Ansehen</a>
						<form method="POST" action="?/toggleSuspend" use:enhance>
							<input type="hidden" name="id" value={b.id} />
							<input type="hidden" name="to" value={b.suspended ? 'unsuspend' : 'suspend'} />
							<button class="btn" class:btn--danger={!b.suspended} type="submit">
								{b.suspended ? 'Freigeben' : 'Sperren'}
							</button>
						</form>
						{#if confirmDelete === b.id}
							<form
								method="POST"
								action="?/deleteBook"
								use:enhance={() => {
									return async ({ update }) => {
										confirmDelete = null;
										await update();
									};
								}}
							>
								<input type="hidden" name="id" value={b.id} />
								<button class="btn btn--danger">Wirklich löschen</button>
							</form>
							<button class="btn" type="button" onclick={() => (confirmDelete = null)}>
								Abbrechen
							</button>
						{:else}
							<button class="btn btn--danger" type="button" onclick={() => (confirmDelete = b.id)}>
								Löschen
							</button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin: 0.1rem 0 0;
	}
	.hint {
		color: var(--ink-300);
		font-size: var(--step--1);
	}
	.hint code {
		background: var(--paper-100);
		border: 1px solid var(--surface-line);
		border-radius: 4px;
		padding: 0.05rem 0.35rem;
	}

	.center {
		display: grid;
		place-items: center;
		min-height: calc(100vh - var(--footer-h));
		padding: clamp(1.5rem, 6vw, 4rem) 16px;
	}
	.card {
		width: min(100%, 26rem);
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: clamp(1.4rem, 1rem + 3vw, 2.4rem);
		box-shadow: 0 20px 44px -28px var(--shadow-book);
	}
	.gate {
		max-width: 24rem;
	}
	.gate p {
		color: var(--ink-500);
	}
	.gate form {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		margin-top: 1.2rem;
	}
	.gate input[type='password'] {
		width: 100%;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.55rem 0.7rem;
		font: inherit;
	}
	.gate button {
		align-self: flex-start;
		background: var(--oxblood);
		color: var(--paper-100);
		border: 0;
		border-radius: 999px;
		padding: 0.55rem 1.3rem;
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: var(--step--1);
		cursor: pointer;
	}
	.err {
		color: var(--danger);
		font-size: var(--step--1);
		margin: 0;
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.2rem;
	}
	.count {
		font-family: var(--font-label);
		font-size: var(--step-0);
		color: var(--ink-300);
	}
	.head__controls {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		flex-wrap: wrap;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: var(--step--1);
		color: var(--ink-500);
		white-space: nowrap;
	}
	.search {
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		font: inherit;
		font-size: var(--step--1);
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.7rem 0.9rem;
	}
	.row--suspended {
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
		background: color-mix(in srgb, var(--danger) 6%, var(--surface));
	}
	.row__main {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.meta {
		font-size: var(--step--1);
		color: var(--ink-500);
	}
	.badges {
		display: flex;
		gap: 0.5rem;
	}
	.badge {
		align-self: flex-start;
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.04em;
		color: var(--danger);
	}
	.badge--inactive {
		color: var(--ink-300);
	}
	.row__actions {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
		align-items: center;
	}
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
		padding: 0.45rem 1rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}
	.btn--danger {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
	}
</style>
