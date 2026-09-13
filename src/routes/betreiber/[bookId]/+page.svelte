<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const newLink = $derived(
		form && 'newLink' in form ? (form.newLink as { role: string; url: string }) : null
	);

	let copied = $state(false);
	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			copied = false;
		}
	}

	const roleLabel: Record<string, string> = {
		admin: 'Verwalten-Link',
		read: 'Ansehen-Link',
		write: 'Eintragen-Link'
	};
</script>

<svelte:head><title>{data.book.title} – Betreiber</title></svelte:head>

<a class="back" href={resolve('/betreiber')}>&larr; Zurück zur Übersicht</a>

<header class="head">
	<h1>{data.book.title}</h1>
	{#if data.book.subtitle}<p class="subtitle">{data.book.subtitle}</p>{/if}
	{#if data.book.suspended}<span class="badge">Gesperrt</span>{/if}
</header>

<section class="links">
	<h2>Links neu erstellen</h2>
	<p class="hint">
		Aus Sicherheitsgründen werden Links nicht im Klartext gespeichert. Wenn jemand seinen Link
		verloren hat, hier einen neuen erzeugen – der alte wird dann ungültig.
	</p>

	{#if newLink}
		<div class="flash">
			<p><strong>{roleLabel[newLink.role]}</strong> – jetzt kopieren, wird nur einmal angezeigt:</p>
			<div class="linkrow">
				<code>{newLink.url}</code>
				<button type="button" onclick={() => copy(newLink.url)}>
					{copied ? 'Kopiert' : 'Kopieren'}
				</button>
			</div>
		</div>
	{/if}

	<div class="linkbtns">
		{#each ['admin', 'read', 'write'] as const as role (role)}
			<form method="POST" action="?/regenerateLink" use:enhance>
				<input type="hidden" name="role" value={role} />
				<button class="btn" type="submit">Neuen {roleLabel[role]} erzeugen</button>
			</form>
		{/each}
	</div>
</section>

<section>
	<h2>Einträge <span class="count">{data.entries.length}</span></h2>

	{#if data.entries.length === 0}
		<p class="hint">Noch keine Einträge.</p>
	{:else}
		<ul class="entries">
			{#each data.entries as e (e.id)}
				<li class="entry">
					<div class="entry__head">
						{#if e.avatar}
							<img class="avatar" src={e.avatar} alt="" />
						{:else}
							<div class="avatar avatar--empty" aria-hidden="true"></div>
						{/if}
						<strong>{e.displayName}</strong>
						<span class="pill pill--{e.state}">{e.stateLabel}</span>
					</div>

					{#if e.answers.length}
						<dl class="answers">
							{#each e.answers as a (a.label)}
								<dt>{a.label}</dt>
								<dd>{a.value}</dd>
							{/each}
						</dl>
					{/if}

					{#if e.closingLine}<p class="closing">„{e.closingLine}"</p>{/if}

					{#if e.drawing || e.photos.length}
						<div class="thumbs">
							{#if e.drawing}<img src={e.drawing} alt="Zeichnung" />{/if}
							{#each e.photos as p (p.id)}
								<img src={p.thumb} alt="" />
							{/each}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.back {
		display: inline-block;
		font-size: var(--step--1);
		color: var(--ink-500);
		margin-bottom: 1rem;
	}
	.head {
		display: flex;
		align-items: baseline;
		gap: 0.8rem;
		flex-wrap: wrap;
		margin-bottom: 1.4rem;
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin: 0;
	}
	.subtitle {
		color: var(--ink-500);
		margin: 0;
	}
	.badge {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.04em;
		color: var(--danger);
	}

	section {
		margin-bottom: 2rem;
	}
	h2 {
		font-family: var(--font-label);
		font-size: var(--step-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.6rem;
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
	.hint {
		font-size: var(--step--1);
		color: var(--ink-300);
		margin: 0.2rem 0 0.8rem;
	}

	.linkbtns {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
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
	}
	.flash {
		background: color-mix(in srgb, var(--ochre) 12%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--ochre) 40%, var(--surface-line));
		border-radius: 6px;
		padding: 0.6rem 0.85rem;
		font-size: var(--step--1);
		margin-bottom: 0.8rem;
	}
	.linkrow {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		background: var(--paper-100);
		border: 1px solid var(--surface-line);
		border-radius: 6px;
		padding: 0.5rem 0.6rem;
		margin-top: 0.3rem;
	}
	.linkrow code {
		flex: 1;
		font-size: 0.78rem;
		word-break: break-all;
		color: var(--ink-700);
	}
	.linkrow button {
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

	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.entry {
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.8rem 1rem;
	}
	.entry__head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.avatar {
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		object-fit: cover;
	}
	.avatar--empty {
		background: var(--paper-300);
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
		color: var(--ink-500);
	}
	.pill--submitted,
	.pill--draft {
		color: var(--ochre-deep);
		border-color: color-mix(in srgb, var(--ochre) 40%, var(--surface-line));
	}
	.answers {
		margin: 0.7rem 0 0;
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.15rem 0.8rem;
	}
	.answers dt {
		font-family: var(--font-label);
		font-size: var(--step--1);
		color: var(--ink-300);
	}
	.answers dd {
		margin: 0;
		font-family: var(--font-hand);
		color: var(--ink-700);
	}
	.closing {
		font-family: var(--font-hand);
		color: var(--ink-500);
		margin: 0.6rem 0 0;
	}
	.thumbs {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
		margin-top: 0.7rem;
	}
	.thumbs img {
		width: 4rem;
		height: 4rem;
		object-fit: cover;
		border-radius: 4px;
		border: 1px solid var(--surface-line);
	}
</style>
