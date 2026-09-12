<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import BookPage from '$lib/book/BookPage.svelte';
	import ImagePicker from '$lib/book/ImagePicker.svelte';
	import DrawingSlot from '$lib/book/DrawingSlot.svelte';

	type Q = {
		id: string;
		label: string;
		section: 'left' | 'right';
		fieldType: 'short' | 'long' | 'date';
		required: boolean;
	};
	type Pic = { id: string; thumbUrl: string };
	type Drawing = { id: string; thumbUrl: string; url: string };

	let {
		token,
		questions,
		action,
		submitLabel,
		initial,
		lockName = false,
		moderationHint = false,
		requireConsent = false,
		message,
		extraActions
	}: {
		token: string;
		questions: Q[];
		action: string;
		submitLabel: string;
		initial?: {
			displayName?: string;
			closingLine?: string;
			answers?: Record<string, string>;
			avatar?: Pic;
			photos?: Pic[];
			drawing?: Drawing;
		};
		lockName?: boolean;
		moderationHint?: boolean;
		/** Einwilligungs-Checkbox einblenden (nur beim erstmaligen Anlegen eines Eintrags) */
		requireConsent?: boolean;
		message?: string;
		extraActions?: Snippet;
	} = $props();

	const leftQuestions = $derived(questions.filter((q) => q.section === 'left'));
	const rightQuestions = $derived(questions.filter((q) => q.section === 'right'));

	let displayName = $state(untrack(() => initial?.displayName ?? ''));
	let closingLine = $state(untrack(() => initial?.closingLine ?? ''));
	let avatarAssetId = $state(untrack(() => initial?.avatar?.id ?? ''));
	let photoAssetIds = $state<string[]>(untrack(() => (initial?.photos ?? []).map((p) => p.id)));
	let drawingAssetId = $state(untrack(() => initial?.drawing?.id ?? ''));
	let answers = $state<Record<string, string>>(
		untrack(() => Object.fromEntries(questions.map((q) => [q.id, initial?.answers?.[q.id] ?? ''])))
	);
	let consent = $state(false);
	let submitting = $state(false);
</script>

<form
	method="POST"
	{action}
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	{#if message}<p class="formError">{message}</p>{/if}

	<input type="hidden" name="avatarAssetId" value={avatarAssetId} />
	<input type="hidden" name="photoAssetIds" value={photoAssetIds.join(',')} />
	<input type="hidden" name="drawingAssetId" value={drawingAssetId} />

	<div class="spread">
		<BookPage side="left">
			<div class="sheet">
				<div class="head">
					<label class="from">
						<span class="label">Eintrag von</span>
						<input
							class="hand"
							name="displayName"
							required
							maxlength="80"
							bind:value={displayName}
							readonly={lockName}
							placeholder="dein Name"
						/>
					</label>
					<ImagePicker
						{token}
						kind="avatar"
						variant="avatar"
						initial={initial?.avatar ? [initial.avatar] : []}
						bind:value={avatarAssetId}
					/>
				</div>
				<div class="q">
					<span class="label">Zeichnung <span class="opt">optional</span></span>
					<DrawingSlot {token} initial={initial?.drawing} bind:value={drawingAssetId} />
				</div>
				{#each leftQuestions as q (q.id)}
					<label class="q">
						<span class="label">{q.label}{q.required ? ' *' : ''}</span>
						{#if q.fieldType === 'date'}
							<input type="date" name="q_{q.id}" class="hand" bind:value={answers[q.id]} />
						{:else if q.fieldType === 'short'}
							<input name="q_{q.id}" class="hand" maxlength="200" bind:value={answers[q.id]} />
						{:else}
							<textarea
								name="q_{q.id}"
								class="hand"
								rows="2"
								maxlength="1000"
								bind:value={answers[q.id]}></textarea>
						{/if}
					</label>
				{/each}
			</div>
		</BookPage>

		<BookPage side="right">
			<div class="sheet">
				{#each rightQuestions as q (q.id)}
					<label class="q">
						<span class="label">{q.label}{q.required ? ' *' : ''}</span>
						{#if q.fieldType === 'date'}
							<input type="date" name="q_{q.id}" class="hand" bind:value={answers[q.id]} />
						{:else if q.fieldType === 'short'}
							<input name="q_{q.id}" class="hand" maxlength="200" bind:value={answers[q.id]} />
						{:else}
							<textarea
								name="q_{q.id}"
								class="hand"
								rows="2"
								maxlength="1000"
								bind:value={answers[q.id]}></textarea>
						{/if}
					</label>
				{/each}
				<div class="q">
					<span class="label">Fotos</span>
					<ImagePicker
						{token}
						kind="photo"
						variant="photos"
						initial={initial?.photos ?? []}
						bind:value={photoAssetIds}
					/>
				</div>
				<label class="q closing">
					<span class="label">Grußformel</span>
					<input
						name="closingLine"
						class="hand"
						maxlength="120"
						bind:value={closingLine}
						placeholder="Alles Liebe, …"
					/>
				</label>
			</div>
		</BookPage>
	</div>

	{#if requireConsent}
		<label class="consent">
			<input type="checkbox" name="consent" required bind:checked={consent} />
			<span>
				Ich habe die
				<a href={resolve('/datenschutz')} target="_blank" rel="noopener">Datenschutzerklärung</a>
				gelesen und bin einverstanden, dass meine Angaben für dieses Freundebuch gespeichert werden. Fotos
				lade ich nur hoch, wenn ich dazu berechtigt bin und – falls andere Personen zu sehen sind – deren
				Einverständnis habe.
			</span>
		</label>
	{/if}

	<div class="actions">
		<button class="cta" type="submit" disabled={submitting || (requireConsent && !consent)}>
			{submitting ? 'Wird gespeichert …' : submitLabel}
		</button>
		{#if moderationHint}<span class="hint">Erscheint erst nach Freigabe.</span>{/if}
		{#if extraActions}{@render extraActions()}{/if}
	</div>
</form>

<style>
	form {
		max-width: 60rem;
		margin: 0 auto;
	}
	.formError {
		margin: 0 0 1rem;
		color: var(--danger);
		font-size: var(--step--1);
		background: var(--surface);
		border: 1px solid color-mix(in srgb, var(--danger) 40%, var(--surface-line));
		border-radius: 6px;
		padding: 0.5rem 0.8rem;
	}

	.spread {
		display: grid;
		grid-template-columns: 1fr;
		border-radius: 6px;
		overflow: hidden;
		box-shadow: 0 30px 60px -22px var(--shadow-book);
	}
	@media (min-width: 900px) {
		.spread {
			grid-template-columns: 1fr 1fr;
		}
	}

	.sheet {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}
	.head .from {
		flex: 1;
	}
	.from,
	.q {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.q .label {
		font-size: var(--step--1);
		letter-spacing: 0.05em;
		color: var(--ink-500);
	}
	.q .opt {
		text-transform: none;
		letter-spacing: 0;
		color: var(--ink-300);
	}
	input,
	textarea {
		border: 0;
		border-bottom: 1.5px solid var(--paper-line);
		background: color-mix(in srgb, var(--paper-100) 60%, transparent);
		padding: 0.3rem 0.2rem;
		font-size: var(--step-1);
		color: var(--ink-900);
	}
	textarea {
		resize: vertical;
		border: 1.5px solid var(--paper-line);
		border-radius: 4px;
	}
	input:focus-visible,
	textarea:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 1px;
	}
	input[readonly] {
		opacity: 0.75;
	}

	.consent {
		max-width: 60rem;
		margin: 1.4rem auto 0;
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: 0.8rem 1rem;
		font-size: var(--step--1);
		color: var(--ink-700);
		cursor: pointer;
	}
	.consent input {
		margin-top: 0.2em;
		flex-shrink: 0;
	}
	.consent a {
		color: var(--ochre-deep);
	}

	.actions {
		margin: 1.4rem auto 0;
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 999px;
		padding: 0.6rem 0.9rem;
	}
	.cta {
		display: inline-block;
		background: var(--oxblood);
		color: var(--paper-100);
		border: 0;
		border-radius: 999px;
		padding: 0.7rem 1.4rem;
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: var(--step--1);
		cursor: pointer;
		text-decoration: none;
	}
	.cta:disabled {
		opacity: 0.5;
	}
	.hint {
		font-size: var(--step--1);
		color: var(--ink-300);
	}
</style>
