<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const s = untrack(() => (data.locked ? null : data.settings));

	let title = $state(s?.title ?? '');
	let subtitle = $state(s?.subtitle ?? '');
	let introText = $state(s?.introText ?? '');
	let moderationMode = $state(s?.moderationMode ?? 'instant');
	let openWriteEnabled = $state(s?.openWriteEnabled ?? true);
	let recoveryEmail = $state(s?.recoveryEmail ?? '');
	let theme = $state(s?.theme ?? 'klassisch');
	let deleteConfirm = $state('');
	let showDelete = $state(false);

	const status = $derived(data.locked ? 'open' : data.settings.status);
	const saved = $derived(Boolean(form && 'saved' in form && form.saved));
	const message = $derived(form && 'message' in form ? form.message : undefined);
</script>

<svelte:head><title>Buch-Einstellungen</title></svelte:head>

{#if !data.locked}
	<div class="wrap">
		{#if saved}<p class="flash">Gespeichert.</p>{/if}
		{#if message}<p class="flash flash--err">{message}</p>{/if}

		<form
			method="POST"
			action="?/save"
			use:enhance={() =>
				async ({ update }) =>
					update({ reset: false })}
		>
			<label class="field">
				<span class="label">Titel</span>
				<input name="title" bind:value={title} required maxlength="120" />
			</label>
			<label class="field">
				<span class="label">Untertitel</span>
				<input name="subtitle" bind:value={subtitle} maxlength="120" />
			</label>
			<label class="field">
				<span class="label">Begrüßungstext (erste Seite)</span>
				<textarea name="introText" bind:value={introText} rows="4" maxlength="2000"></textarea>
			</label>

			<fieldset class="field">
				<legend class="label">Neue Einträge</legend>
				<label class="radio">
					<input type="radio" name="moderationMode" value="instant" bind:group={moderationMode} />
					Sofort sichtbar
				</label>
				<label class="radio">
					<input type="radio" name="moderationMode" value="review" bind:group={moderationMode} />
					Erst nach Freigabe
				</label>
			</fieldset>

			<label class="check">
				<input type="checkbox" name="openWriteEnabled" bind:checked={openWriteEnabled} />
				Offener Eintragen-Link aktiv (personalisierte Einladungen bleiben unberührt)
			</label>

			<label class="field">
				<span class="label">E-Mail für den Notfall</span>
				<input name="recoveryEmail" type="email" bind:value={recoveryEmail} maxlength="200" />
				<span class="hint">Für die Wiederherstellung des Admin-Links, falls du ihn verlierst.</span>
			</label>

			<fieldset class="field">
				<legend class="label">Einband-Design</legend>
				<div class="themes">
					{#each data.locked ? [] : data.themes as t (t.id)}
						<label class="theme-card" class:theme-card--on={theme === t.id}>
							<input type="radio" name="theme" value={t.id} bind:group={theme} />
							<span
								class="theme-card__swatch"
								style:background={`linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})`}
							></span>
							<span class="theme-card__text">
								<span class="theme-card__name">{t.name}</span>
								<span class="theme-card__desc">{t.description}</span>
							</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<button class="btn btn--primary" type="submit">Speichern</button>
		</form>

		<hr />

		<section>
			<h2>Status</h2>
			<p class="hint">
				Aktuell: <strong
					>{status === 'open'
						? 'offen'
						: status === 'closed'
							? 'geschlossen (keine neuen Einträge)'
							: 'archiviert'}</strong
				>
			</p>
			<div class="row">
				{#if status !== 'open'}
					<form method="POST" action="?/status" use:enhance>
						<input type="hidden" name="to" value="open" />
						<button class="btn">Wieder öffnen</button>
					</form>
				{/if}
				{#if status !== 'closed'}
					<form method="POST" action="?/status" use:enhance>
						<input type="hidden" name="to" value="closed" />
						<button class="btn">Für neue Einträge schließen</button>
					</form>
				{/if}
				{#if status !== 'archived'}
					<form method="POST" action="?/status" use:enhance>
						<input type="hidden" name="to" value="archived" />
						<button class="btn">Archivieren</button>
					</form>
				{/if}
			</div>
		</section>

		<hr />

		<section class="danger">
			<h2>Buch löschen</h2>
			<p class="hint">
				Löscht das Buch mit allen Einträgen und Bildern unwiderruflich. Alle drei Links werden
				ungültig.
			</p>
			{#if showDelete}
				<form method="POST" action="?/deleteBook" use:enhance>
					<label class="field">
						<span class="label">Zum Bestätigen den Buchtitel „{title}" eingeben</span>
						<input name="confirm" bind:value={deleteConfirm} autocomplete="off" />
					</label>
					<div class="row">
						<button class="btn btn--danger" type="submit" disabled={deleteConfirm !== title}>
							Endgültig löschen
						</button>
						<button class="btn" type="button" onclick={() => (showDelete = false)}>Abbrechen</button
						>
					</div>
				</form>
			{:else}
				<button class="btn btn--danger" type="button" onclick={() => (showDelete = true)}>
					Buch löschen …
				</button>
			{/if}
		</section>
	</div>
{/if}

<style>
	.wrap {
		max-width: 40rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		border: 0;
		padding: 0;
		margin: 0;
	}
	.label {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: var(--step--1);
		color: var(--ink-700);
	}
	input,
	textarea {
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.5rem 0.65rem;
		font: inherit;
		font-size: var(--step-0);
	}
	textarea {
		resize: vertical;
	}
	.hint {
		font-size: var(--step--1);
		color: var(--ink-300);
	}
	.radio,
	.check {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: var(--step-0);
	}

	.themes {
		display: grid;
		gap: 0.6rem;
		grid-template-columns: 1fr;
	}
	@media (min-width: 560px) {
		.themes {
			grid-template-columns: 1fr 1fr;
		}
	}
	.theme-card {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.6rem 0.8rem;
		border: 1px solid var(--surface-line);
		border-radius: 6px;
		cursor: pointer;
	}
	.theme-card--on {
		border-color: var(--ochre);
		box-shadow: inset 0 0 0 1px var(--ochre);
	}
	.theme-card input {
		position: absolute;
		opacity: 0;
	}
	.theme-card__swatch {
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		flex-shrink: 0;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
	}
	.theme-card__text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.theme-card__name {
		font-family: var(--font-label);
		font-weight: 500;
	}
	.theme-card__desc {
		font-size: var(--step--1);
		color: var(--ink-500);
	}

	.flash {
		background: color-mix(in srgb, var(--ok) 14%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--ok) 40%, var(--surface-line));
		border-radius: 6px;
		padding: 0.5rem 0.8rem;
		font-size: var(--step--1);
	}
	.flash--err {
		background: color-mix(in srgb, var(--danger) 12%, var(--surface));
		border-color: color-mix(in srgb, var(--danger) 40%, var(--surface-line));
		color: var(--danger);
	}

	hr {
		border: 0;
		border-top: 1px solid var(--surface-line);
		margin: 2rem 0;
	}
	h2 {
		font-family: var(--font-label);
		font-size: var(--step-0);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem;
	}
	.row {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		margin-top: 0.6rem;
	}
	.danger h2 {
		color: var(--danger);
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
		align-self: flex-start;
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: default;
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
</style>
