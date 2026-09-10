<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import BookPage from '$lib/book/BookPage.svelte';
	import ImagePicker from '$lib/book/ImagePicker.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let displayName = $state(untrack(() => (!data.locked && !data.closed ? data.prefillName : '')));
	let avatarAssetId = $state('');
	let photoAssetIds = $state<string[]>([]);

	const closed = $derived(!data.locked && data.closed);
	const questions = $derived('questions' in data && data.questions ? data.questions : []);
	const leftQuestions = $derived(questions.filter((q) => q.section === 'left'));
	const rightQuestions = $derived(questions.filter((q) => q.section === 'right'));

	let submitting = $state(false);
	const message = $derived(form && 'message' in form ? form.message : undefined);
	const done = $derived(form && 'done' in form ? form.done : undefined);

	let copied = $state(false);
	async function copyLink(link: string) {
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			copied = false;
		}
	}
</script>

<svelte:head><title>{data.bookTitle} · eintragen</title></svelte:head>

{#if data.locked}
	<!-- Layout zeigt die Passwort-Abfrage -->
{:else if done}
	<main class="centered">
		<section class="card">
			<h1>Danke!</h1>
			<p>
				{done.published
					? 'Dein Eintrag steht jetzt im Buch.'
					: 'Dein Eintrag wurde abgeschickt und erscheint, sobald er freigegeben ist.'}
			</p>
			<p class="editlink-label label">Dein Bearbeitungs-Link (aufbewahren):</p>
			<div class="editlink">
				<code>{done.editLink}</code>
				<button type="button" onclick={() => copyLink(done.editLink)}>
					{copied ? 'Kopiert' : 'Kopieren'}
				</button>
			</div>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- ggf. externe Buch-URL -->
			<a class="cta" href={done.readLink} data-sveltekit-reload>Buch ansehen</a>
		</section>
	</main>
{:else if closed}
	<main class="centered">
		<section class="card">
			<h1>{data.bookTitle}</h1>
			<p>Dieses Buch nimmt derzeit keine neuen Einträge an.</p>
			<a class="cta" href={resolve('/b/[token]/lesen', { token: data.token })}>Buch ansehen</a>
		</section>
	</main>
{:else}
	<main>
		<form
			method="POST"
			action="?/submit"
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
									readonly={!data.locked && !data.closed && data.lockName}
									placeholder="dein Name"
								/>
							</label>
							<ImagePicker
								token={data.token}
								kind="avatar"
								variant="avatar"
								bind:value={avatarAssetId}
							/>
						</div>
						{#each leftQuestions as q (q.id)}
							<label class="q">
								<span class="label">{q.label}{q.required ? ' *' : ''}</span>
								{#if q.fieldType === 'date'}
									<input type="date" name="q_{q.id}" class="hand" />
								{:else if q.fieldType === 'short'}
									<input name="q_{q.id}" class="hand" maxlength="200" />
								{:else}
									<textarea name="q_{q.id}" class="hand" rows="2" maxlength="1000"></textarea>
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
									<input type="date" name="q_{q.id}" class="hand" />
								{:else if q.fieldType === 'short'}
									<input name="q_{q.id}" class="hand" maxlength="200" />
								{:else}
									<textarea name="q_{q.id}" class="hand" rows="2" maxlength="1000"></textarea>
								{/if}
							</label>
						{/each}
						<div class="q">
							<span class="label">Fotos</span>
							<ImagePicker
								token={data.token}
								kind="photo"
								variant="photos"
								bind:value={photoAssetIds}
							/>
						</div>
						<label class="q closing">
							<span class="label">Grußformel</span>
							<input name="closingLine" class="hand" maxlength="120" placeholder="Alles Liebe, …" />
						</label>
					</div>
				</BookPage>
			</div>

			<div class="actions">
				<button class="cta" type="submit" disabled={submitting}>
					{submitting ? 'Wird gespeichert …' : 'Eintrag abschließen'}
				</button>
				{#if data.book && 'moderationMode' in data.book && data.book.moderationMode === 'review'}
					<span class="hint">Erscheint erst nach Freigabe.</span>
				{/if}
			</div>
		</form>
	</main>
{/if}

<style>
	main {
		padding: clamp(1rem, 4vw, 3rem) 16px;
	}
	main.centered {
		min-height: 100vh;
		display: grid;
		place-items: center;
	}
	.card {
		width: min(100%, 30rem);
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: clamp(1.4rem, 1rem + 3vw, 2.4rem);
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		margin: 0 0 0.6rem;
	}

	form {
		max-width: 60rem;
		margin: 0 auto;
	}
	.formError {
		max-width: 60rem;
		margin: 0 auto 1rem;
		color: var(--danger);
		font-size: var(--step--1);
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
	.from input {
		font-size: var(--step-1);
	}

	.actions {
		max-width: 60rem;
		margin: 1.4rem auto 0;
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
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

	.editlink-label {
		margin: 1.2rem 0 0.3rem;
		font-size: var(--step--1);
		color: var(--ink-500);
	}
	.editlink {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		background: var(--paper-100);
		border: 1px solid var(--surface-line);
		border-radius: 6px;
		padding: 0.5rem 0.6rem;
		margin-bottom: 1.2rem;
	}
	.editlink code {
		flex: 1;
		font-size: 0.78rem;
		word-break: break-all;
		color: var(--ink-700);
	}
	.editlink button {
		border: 1px solid var(--surface-line);
		background: var(--surface);
		border-radius: 999px;
		padding: 0.25rem 0.7rem;
		font-family: var(--font-label);
		font-size: var(--step--1);
		cursor: pointer;
		white-space: nowrap;
	}
</style>
