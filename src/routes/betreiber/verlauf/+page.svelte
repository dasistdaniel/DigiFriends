<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const actorLabel: Record<string, string> = {
		admin: 'Buch-Admin',
		operator: 'Betreiber',
		system: 'System'
	};
	const roleLabel: Record<string, string> = {
		admin: 'Admin-Link',
		read: 'Ansehen-Link',
		write: 'Eintragen-Link'
	};
	const statusLabel: Record<string, string> = {
		open: 'offen',
		closed: 'geschlossen',
		archived: 'archiviert'
	};

	function describe(action: string, meta: Record<string, unknown>): string {
		const role = typeof meta.role === 'string' ? (roleLabel[meta.role] ?? meta.role) : '';
		const to = typeof meta.to === 'string' ? (statusLabel[meta.to] ?? meta.to) : '';
		const label = typeof meta.label === 'string' ? meta.label : '';
		const entryName = typeof meta.entryDisplayName === 'string' ? meta.entryDisplayName : '';

		switch (action) {
			case 'book.suspend':
				return 'Buch gesperrt';
			case 'book.unsuspend':
				return 'Buch freigegeben';
			case 'book.delete':
				return 'Buch gelöscht';
			case 'book.status-change':
				return `Status geändert zu „${to}"`;
			case 'access.regenerate':
				return `${role} neu erzeugt`;
			case 'access.password-set':
				return `Passwort gesetzt (${role})`;
			case 'access.password-removed':
				return `Passwort entfernt (${role})`;
			case 'access.recovered':
				return 'Admin-Link per E-Mail-Wiederherstellung erneuert';
			case 'invite.create':
				return `Einladung „${label}" angelegt`;
			case 'invite.revoke':
				return `Einladung „${label}" zurückgezogen`;
			case 'entry.publish':
				return `Eintrag von „${entryName}" freigegeben`;
			case 'entry.hide':
				return `Eintrag von „${entryName}" verborgen`;
			case 'entry.unhide':
				return `Eintrag von „${entryName}" wieder eingeblendet`;
			case 'entry.delete':
				return `Eintrag von „${entryName}" gelöscht`;
			default:
				return action;
		}
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head><title>Verlauf – Betreiber-Bereich</title></svelte:head>

<h1>Verlauf</h1>
<p class="hint">
	Die letzten {data.limit} Aktionen über alle Bücher hinweg – wer was gemacht hat, unabhängig davon, ob
	das Buch noch existiert.
</p>

{#if data.entries.length === 0}
	<p class="hint">Noch keine Einträge.</p>
{:else}
	<ul class="list">
		{#each data.entries as e (e.id)}
			<li class="row">
				<div class="row__main">
					<span class="what">{describe(e.action, e.meta)}</span>
					<span class="meta">
						{actorLabel[e.actorRole ?? ''] ?? e.actorRole ?? 'Unbekannt'} · {formatDate(
							e.createdAt
						)}
						{#if e.bookTitle}
							·
							{#if e.bookId}
								<a href={resolve('/betreiber/[bookId]', { bookId: e.bookId })}>{e.bookTitle}</a>
							{:else}
								{e.bookTitle} (gelöscht)
							{/if}
						{/if}
					</span>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin: 0.1rem 0 1rem;
	}
	.hint {
		color: var(--ink-300);
		font-size: var(--step--1);
		margin: 0 0 1rem;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.row {
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.6rem 0.9rem;
	}
	.row__main {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.what {
		font-size: var(--step-0);
		color: var(--ink-900);
	}
	.meta {
		font-size: var(--step--1);
		color: var(--ink-500);
	}
	.meta a {
		color: var(--ochre-deep);
	}
</style>
