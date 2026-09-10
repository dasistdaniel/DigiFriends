<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const d = $derived(data.locked ? null : data);
	const message = $derived(form && 'message' in form ? form.message : undefined);
	const newLink = $derived(
		form && 'newLink' in form
			? (form.newLink as { role: string; url: string; label?: string })
			: null
	);

	let copied = $state<string | null>(null);
	async function copy(key: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = key;
			setTimeout(() => (copied === key ? (copied = null) : null), 1600);
		} catch {
			copied = null;
		}
	}

	const roleLabel: Record<string, string> = {
		admin: 'Verwalten-Link',
		read: 'Ansehen-Link',
		write: 'Offener Eintragen-Link',
		invite: 'Persönliche Einladung'
	};
</script>

<svelte:head><title>Zugänge</title></svelte:head>

{#if d}
	{#if message}<p class="flash flash--err">{message}</p>{/if}

	{#if newLink}
		<div class="flash flash--link">
			<p>
				<strong>{roleLabel[newLink.role]}{newLink.label ? ` „${newLink.label}"` : ''}</strong> – jetzt
				kopieren, wird nur einmal angezeigt:
			</p>
			<div class="linkrow">
				<code>{newLink.url}</code>
				<button type="button" onclick={() => copy('new', newLink.url)}>
					{copied === 'new' ? 'Kopiert' : 'Kopieren'}
				</button>
			</div>
			{#if newLink.role !== 'invite'}<p class="hint">
					Der vorherige Link funktioniert nicht mehr.
				</p>{/if}
		</div>
	{/if}

	<section>
		<h2>Links</h2>
		<div class="link">
			<span class="label">Verwalten (Admin)</span>
			<div class="linkrow">
				<code>{d.adminLink}</code>
				<button type="button" onclick={() => copy('admin', d.adminLink)}>
					{copied === 'admin' ? 'Kopiert' : 'Kopieren'}
				</button>
			</div>
		</div>

		{#each ['read', 'write'] as const as role (role)}
			<div class="link">
				<span class="label">{role === 'read' ? 'Ansehen' : 'Eintragen (offen)'}</span>
				<p class="hint">
					Aus Sicherheitsgründen wird der Link nicht gespeichert. Falls du ihn verloren hast,
					erzeuge einen neuen – der alte wird dann ungültig.
				</p>
				<form method="POST" action="?/regenerate" use:enhance>
					<input type="hidden" name="role" value={role} />
					<button class="btn"
						>Neuen {role === 'read' ? 'Ansehen' : 'Eintragen'}-Link erzeugen</button
					>
				</form>
			</div>
		{/each}
	</section>

	<hr />

	<section>
		<h2>Passwörter</h2>
		<p class="hint">Leer lassen und „Übernehmen" entfernt ein bestehendes Passwort.</p>
		{#each [['admin', 'Verwalten'], ['read', 'Ansehen'], ['write', 'Eintragen (offen)']] as const as [role, name] (role)}
			<form method="POST" action="?/setPassword" use:enhance class="pwrow">
				<input type="hidden" name="role" value={role} />
				<span class="pwrow__name">
					{name}
					<span class="badge" class:badge--on={d.passwords[role]}>
						{d.passwords[role] ? 'geschützt' : 'offen'}
					</span>
				</span>
				<input name="password" type="text" autocomplete="off" placeholder="neues Passwort" />
				<button class="btn">Übernehmen</button>
			</form>
		{/each}
	</section>

	<hr />

	<section>
		<h2>Persönliche Einladungen</h2>
		<p class="hint">
			Ein eigener Link je Person – erlaubt genau einen Eintrag, Name vorausgefüllt, einzeln
			widerrufbar.
		</p>

		{#if d.invites.length}
			<ul class="invites">
				{#each d.invites as inv (inv.id)}
					<li class:revoked={inv.revoked}>
						<div>
							<strong>{inv.label}</strong>
							<span class="hint">
								{inv.usedCount}/{inv.maxEntries ?? '∞'} genutzt{inv.revoked
									? ' · zurückgezogen'
									: ''}
							</span>
						</div>
						{#if !inv.revoked}
							<form method="POST" action="?/revokeInvite" use:enhance>
								<input type="hidden" name="id" value={inv.id} />
								<button class="btn btn--danger">Zurückziehen</button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<form
			method="POST"
			action="?/createInvite"
			use:enhance={() =>
				async ({ update }) =>
					update({ reset: true })}
			class="newinvite"
		>
			<input name="label" placeholder="z. B. Anna" required maxlength="80" />
			<input name="prefillName" placeholder="Name im Buch (optional)" maxlength="80" />
			<button class="btn btn--primary">Einladung anlegen</button>
		</form>
	</section>
{/if}

<style>
	section {
		margin-bottom: 1rem;
	}
	h2 {
		font-family: var(--font-label);
		font-size: var(--step-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.6rem;
	}
	.label {
		font-family: var(--font-label);
		font-size: var(--step--1);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ink-700);
	}
	.hint {
		font-size: var(--step--1);
		color: var(--ink-300);
		margin: 0.2rem 0;
	}

	.link {
		margin-bottom: 1.1rem;
	}
	.linkrow {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		background: var(--paper-100);
		border: 1px solid var(--surface-line);
		border-radius: 6px;
		padding: 0.5rem 0.6rem;
		margin: 0.3rem 0;
	}
	.linkrow code {
		flex: 1;
		font-size: 0.78rem;
		word-break: break-all;
		color: var(--ink-700);
	}
	.linkrow button,
	.btn {
		font-family: var(--font-label);
		font-size: var(--step--1);
		border: 1px solid var(--surface-line);
		background: var(--surface);
		color: var(--ink-700);
		border-radius: 999px;
		padding: 0.35rem 0.8rem;
		cursor: pointer;
		white-space: nowrap;
	}
	.btn--primary {
		background: var(--oxblood);
		color: var(--paper-100);
		border-color: var(--oxblood);
	}
	.btn--danger {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
	}

	.flash {
		border-radius: 6px;
		padding: 0.6rem 0.85rem;
		font-size: var(--step--1);
		margin-bottom: 1rem;
	}
	.flash--err {
		background: color-mix(in srgb, var(--danger) 12%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--danger) 40%, var(--surface-line));
		color: var(--danger);
	}
	.flash--link {
		background: color-mix(in srgb, var(--ochre) 12%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--ochre) 40%, var(--surface-line));
	}

	.pwrow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.6rem;
	}
	.pwrow__name {
		min-width: 12rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.pwrow input {
		flex: 1;
		min-width: 10rem;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.4rem 0.55rem;
		font: inherit;
		font-size: var(--step--1);
	}
	.badge {
		font-family: var(--font-label);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.05rem 0.4rem;
		border-radius: 999px;
		border: 1px solid var(--surface-line);
		color: var(--ink-300);
	}
	.badge--on {
		color: var(--ok);
		border-color: color-mix(in srgb, var(--ok) 40%, var(--surface-line));
	}

	.invites {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.invites li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 6px;
		padding: 0.5rem 0.7rem;
	}
	.invites li.revoked {
		opacity: 0.5;
	}
	.newinvite {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.newinvite input {
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.45rem 0.6rem;
		font: inherit;
		font-size: var(--step--1);
	}

	hr {
		border: 0;
		border-top: 1px solid var(--surface-line);
		margin: 1.6rem 0;
	}
</style>
