<script lang="ts">
	import { resolve } from '$app/paths';
	import EntryForm from '$lib/book/EntryForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const e = $derived(data.locked ? null : data.entry);
	const questions = $derived(data.locked ? [] : data.questions);
	const message = $derived(form && 'message' in form ? form.message : undefined);
	const saved = $derived(Boolean(form && 'saved' in form && form.saved));

	let confirmDelete = $state(false);
</script>

<svelte:head><title>{data.bookTitle} · Eintrag bearbeiten</title></svelte:head>

{#if e}
	<main>
		<div class="bar">
			<p class="label">
				Eintrag bearbeiten{data.isAdmin ? ' (Admin)' : ''}
				{#if e.state === 'submitted'}<span class="pill">wartet auf Freigabe</span>{/if}
				{#if e.state === 'hidden'}<span class="pill">verborgen</span>{/if}
			</p>
			<a class="viewlink" href={resolve('/b/[token]/lesen', { token: data.token })}>Buch ansehen</a>
		</div>

		{#if saved}<p class="flash">Änderungen gespeichert.</p>{/if}

		<EntryForm
			token={data.token}
			{questions}
			action="?/save"
			submitLabel="Änderungen speichern"
			initial={{
				displayName: e.displayName,
				closingLine: e.closingLine,
				answers: e.answers,
				avatar: e.avatar,
				drawing: e.drawing,
				photos: e.photos
			}}
			{message}
		>
			{#snippet extraActions()}
				{#if confirmDelete}
					<button class="link link--danger" type="submit" formaction="?/deleteEntry">
						Wirklich löschen
					</button>
					<button class="link" type="button" onclick={() => (confirmDelete = false)}
						>Abbrechen</button
					>
				{:else}
					<button class="link link--danger" type="button" onclick={() => (confirmDelete = true)}>
						Eintrag löschen
					</button>
				{/if}
			{/snippet}
		</EntryForm>
	</main>
{/if}

<style>
	main {
		padding: clamp(1rem, 4vw, 3rem) 16px;
	}
	.bar {
		max-width: 60rem;
		margin: 0 auto 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.label {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: var(--step--1);
		color: var(--ink-700);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}
	.pill {
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.68rem;
		border: 1px solid var(--surface-line);
		border-radius: 999px;
		padding: 0.05rem 0.5rem;
		color: var(--ochre-deep);
	}
	.viewlink {
		font-family: var(--font-label);
		font-size: var(--step--1);
	}
	.flash {
		max-width: 60rem;
		margin: 0 auto 1rem;
		background: color-mix(in srgb, var(--ok) 14%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--ok) 40%, var(--surface-line));
		border-radius: 6px;
		padding: 0.5rem 0.8rem;
		font-size: var(--step--1);
	}
	.link {
		background: none;
		border: 0;
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		cursor: pointer;
		color: var(--ink-500);
		padding: 0.3rem 0.4rem;
	}
	.link--danger {
		color: var(--danger);
	}
</style>
