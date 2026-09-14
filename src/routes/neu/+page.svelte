<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const initial = untrack(() =>
		form && 'values' in form ? (form.values as Record<string, string>) : {}
	);

	let title = $state(initial.title ?? '');
	let subtitle = $state(initial.subtitle ?? '');
	let introText = $state(initial.introText ?? '');
	let moderationMode = $state(initial.moderationMode ?? 'instant');
	let passwordAdmin = $state(initial.passwordAdmin ?? '');
	let passwordWrite = $state(initial.passwordWrite ?? '');
	let passwordRead = $state(initial.passwordRead ?? '');
	let recoveryEmail = $state(initial.recoveryEmail ?? '');

	let selectedTemplate = $state(untrack(() => initial.templateId || data.defaultTemplateId));
	let selectedTheme = $state(untrack(() => initial.theme || data.defaultBookThemeId));
	let showAdvanced = $state(
		untrack(() => Boolean(initial.passwordAdmin || initial.passwordWrite || initial.passwordRead))
	);
	let submitting = $state(false);
	let copied = $state<string | null>(null);
	let previewId = $state<string | null>(null);

	const errors = $derived((form && 'errors' in form ? form.errors : undefined) ?? {});

	async function copy(key: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copied = key;
			setTimeout(() => (copied === key ? (copied = null) : null), 1600);
		} catch {
			copied = null;
		}
	}
</script>

<svelte:head><title>Neues Freundebuch anlegen</title></svelte:head>

<main>
	{#if form && 'created' in form && form.created}
		{@const links = form.created.links}
		<section class="panel done">
			<h1>„{form.created.title}" ist angelegt</h1>
			<p class="lead">
				Bewahre diese drei Links gut auf – sie sind der einzige Zugang zum Buch. Es gibt keine
				Anmeldung, über die du sie später wiederfinden könntest.
			</p>

			<ul class="links">
				<li>
					<div class="links__head">
						<span class="label">Verwalten (Admin)</span>
						<button type="button" onclick={() => copy('admin', links.admin)}>
							{copied === 'admin' ? 'Kopiert' : 'Kopieren'}
						</button>
					</div>
					<code>{links.admin}</code>
					<p class="links__hint">
						Fragen bearbeiten, Design, Einträge moderieren, Links verwalten.
					</p>
				</li>
				<li>
					<div class="links__head">
						<span class="label">Eintragen</span>
						<button type="button" onclick={() => copy('write', links.write)}>
							{copied === 'write' ? 'Kopiert' : 'Kopieren'}
						</button>
					</div>
					<code>{links.write}</code>
					<p class="links__hint">Diesen Link teilst du mit allen, die sich eintragen sollen.</p>
				</li>
				<li>
					<div class="links__head">
						<span class="label">Nur ansehen</span>
						<button type="button" onclick={() => copy('read', links.read)}>
							{copied === 'read' ? 'Kopiert' : 'Kopieren'}
						</button>
					</div>
					<code>{links.read}</code>
					<p class="links__hint">Lesen und blättern, ohne etwas ändern zu können.</p>
				</li>
			</ul>

			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- vollständige (ggf. externe) Buch-URL -->
			<a class="cta" href={links.admin} data-sveltekit-reload>Zum Admin-Bereich</a>
		</section>
	{:else}
		<section class="panel">
			<h1>Neues Freundebuch anlegen</h1>
			<p class="lead">
				Kein Konto nötig. Nach dem Anlegen bekommst du drei Links: zum Verwalten, zum Eintragen und
				nur zum Ansehen.
			</p>

			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				<label class="field">
					<span class="label">Titel des Buchs</span>
					<input
						name="title"
						required
						maxlength="120"
						bind:value={title}
						placeholder="z. B. Unser Freundebuch"
					/>
					{#if errors.title}<span class="err">{errors.title[0]}</span>{/if}
				</label>

				<label class="field">
					<span class="label">Untertitel <span class="opt">optional</span></span>
					<input
						name="subtitle"
						maxlength="120"
						bind:value={subtitle}
						placeholder="z. B. Sommer 2026"
					/>
				</label>

				<label class="field">
					<span class="label">Begrüßungstext <span class="opt">optional</span></span>
					<textarea
						name="introText"
						rows="4"
						maxlength="2000"
						bind:value={introText}
						placeholder="Steht auf der ersten Seite, wenn man das Buch aufschlägt."></textarea>
				</label>

				<fieldset class="field">
					<legend class="label">Fragen-Vorlage</legend>
					<div class="cards">
						{#each data.templates as tpl (tpl.id)}
							<div class="card" class:card--on={selectedTemplate === tpl.id}>
								<label class="card__select">
									<input
										type="radio"
										name="templateId"
										value={tpl.id}
										bind:group={selectedTemplate}
									/>
									<span class="card__name">{tpl.name}</span>
									<span class="card__desc">{tpl.description}</span>
								</label>
								<button
									type="button"
									class="card__preview-toggle"
									aria-expanded={previewId === tpl.id}
									onclick={() => (previewId = previewId === tpl.id ? null : tpl.id)}
								>
									{previewId === tpl.id
										? 'Fragen verbergen'
										: `${tpl.questions.length} mögliche Fragen ansehen`}
								</button>
								{#if previewId === tpl.id}
									<p class="card__pick-hint">
										Beim Anlegen werden {tpl.pick.left + tpl.pick.right} davon zufällig ausgewählt – alle,
										die ins Buch schreiben, bekommen dieselbe Auswahl.
									</p>
									<ul class="card__questions">
										{#each tpl.questions as q (q.label)}
											<li>{q.label}</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/each}
					</div>
					<p class="hint">Die Fragen lassen sich später im Admin-Bereich frei anpassen.</p>
				</fieldset>

				<fieldset class="field">
					<legend class="label">Einband-Design</legend>
					<div class="themes">
						{#each data.themes as t (t.id)}
							<label class="theme-card" class:theme-card--on={selectedTheme === t.id}>
								<input type="radio" name="theme" value={t.id} bind:group={selectedTheme} />
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
					<p class="hint">Lässt sich später jederzeit im Admin-Bereich ändern.</p>
				</fieldset>

				<fieldset class="field">
					<legend class="label">Neue Einträge</legend>
					<label class="radio">
						<input type="radio" name="moderationMode" value="instant" bind:group={moderationMode} />
						<span>Sofort im Buch sichtbar</span>
					</label>
					<label class="radio">
						<input type="radio" name="moderationMode" value="review" bind:group={moderationMode} />
						<span>Erst nach meiner Freigabe</span>
					</label>
				</fieldset>

				<button
					type="button"
					class="disclosure"
					onclick={() => (showAdvanced = !showAdvanced)}
					aria-expanded={showAdvanced}
				>
					{showAdvanced ? '−' : '+'} Passwörter &amp; Wiederherstellung
				</button>

				{#if showAdvanced}
					<div class="advanced">
						<p class="hint">
							Jeder Link kann zusätzlich ein eigenes Passwort bekommen. Leer lassen = kein Passwort.
						</p>
						<label class="field">
							<span class="label">Passwort Admin-Link</span>
							<input
								name="passwordAdmin"
								type="text"
								autocomplete="off"
								bind:value={passwordAdmin}
							/>
							{#if errors.passwordAdmin}<span class="err">{errors.passwordAdmin[0]}</span>{/if}
						</label>
						<label class="field">
							<span class="label">Passwort Eintragen-Link</span>
							<input
								name="passwordWrite"
								type="text"
								autocomplete="off"
								bind:value={passwordWrite}
							/>
							{#if errors.passwordWrite}<span class="err">{errors.passwordWrite[0]}</span>{/if}
						</label>
						<label class="field">
							<span class="label">Passwort Ansehen-Link</span>
							<input name="passwordRead" type="text" autocomplete="off" bind:value={passwordRead} />
							{#if errors.passwordRead}<span class="err">{errors.passwordRead[0]}</span>{/if}
						</label>
						<label class="field">
							<span class="label">E-Mail für den Notfall <span class="opt">optional</span></span>
							<input
								name="recoveryEmail"
								type="email"
								bind:value={recoveryEmail}
								placeholder="fuer den Fall, dass du den Admin-Link verlierst"
							/>
							{#if errors.recoveryEmail}<span class="err">{errors.recoveryEmail[0]}</span>{/if}
						</label>
					</div>
				{/if}

				<button class="cta" type="submit" disabled={submitting}>
					{submitting ? 'Wird angelegt …' : 'Freundebuch anlegen'}
				</button>
			</form>
		</section>
	{/if}
</main>

<style>
	main {
		max-width: 42rem;
		margin: 0 auto;
		padding: clamp(2rem, 6vw, 4rem) 16px;
	}
	.panel {
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: clamp(1.4rem, 1rem + 3vw, 2.6rem);
		box-shadow: 0 20px 44px -28px var(--shadow-book);
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin-bottom: 0.4rem;
	}
	.lead {
		color: var(--ink-500);
		max-width: 36rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1.3rem;
		margin-top: 1.6rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: 0;
		padding: 0;
		margin: 0;
	}
	.label {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-size: var(--step--1);
		color: var(--ink-700);
	}
	.opt {
		text-transform: none;
		letter-spacing: 0;
		color: var(--ink-300);
	}
	input,
	textarea {
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.55rem 0.7rem;
		font-family: var(--font-body);
		font-size: var(--step-0);
	}
	textarea {
		resize: vertical;
	}
	.hint {
		font-size: var(--step--1);
		color: var(--ink-300);
		margin: 0.2rem 0 0;
	}
	.err {
		font-size: var(--step--1);
		color: var(--danger);
	}

	.cards {
		display: grid;
		gap: 0.7rem;
		grid-template-columns: 1fr;
	}
	@media (min-width: 560px) {
		.cards {
			grid-template-columns: 1fr 1fr;
		}
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--surface-line);
		border-radius: 6px;
	}
	.card--on {
		border-color: var(--ochre);
		box-shadow: inset 0 0 0 1px var(--ochre);
	}
	.card__select {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		cursor: pointer;
	}
	.card__select input {
		position: absolute;
		opacity: 0;
	}
	.card__name {
		font-family: var(--font-label);
		font-weight: 500;
	}
	.card__desc {
		font-size: var(--step--1);
		color: var(--ink-500);
	}
	.card__preview-toggle {
		align-self: flex-start;
		background: none;
		border: 0;
		padding: 0;
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		color: var(--ochre-deep);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.card__pick-hint {
		margin: 0.6rem 0 0;
		padding-top: 0.6rem;
		border-top: 1px dashed var(--surface-line);
		font-size: var(--step--1);
		color: var(--ink-300);
	}
	.card__questions {
		margin: 0;
		padding: 0.6rem 0 0 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: var(--step--1);
		color: var(--ink-700);
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

	.radio {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0;
	}

	.disclosure {
		align-self: flex-start;
		background: none;
		border: 0;
		color: var(--ochre-deep);
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.04em;
		cursor: pointer;
		padding: 0;
	}
	.advanced {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		border: 1px dashed var(--surface-line);
		border-radius: 6px;
	}

	.cta {
		align-self: flex-start;
		display: inline-block;
		background: var(--oxblood);
		color: var(--paper-100);
		border: 0;
		border-radius: 999px;
		padding: 0.7rem 1.4rem;
		font-family: var(--font-label);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		font-size: var(--step--1);
		cursor: pointer;
		text-decoration: none;
	}
	.cta:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.done .lead {
		color: var(--ink-700);
	}
	.links {
		list-style: none;
		margin: 1.4rem 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.links li {
		border: 1px solid var(--surface-line);
		border-radius: 6px;
		padding: 0.8rem 0.9rem;
		background: var(--paper-100);
	}
	.links__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.4rem;
	}
	.links__head button {
		border: 1px solid var(--surface-line);
		background: var(--surface);
		border-radius: 999px;
		padding: 0.2rem 0.7rem;
		font-family: var(--font-label);
		font-size: var(--step--1);
		cursor: pointer;
	}
	.links code {
		display: block;
		font-size: var(--step--1);
		word-break: break-all;
		color: var(--ink-700);
	}
	.links__hint {
		margin: 0.35rem 0 0;
		font-size: var(--step--1);
		color: var(--ink-300);
	}
</style>
