<script lang="ts">
	import { resolve } from '$app/paths';
	import EntryForm from '$lib/book/EntryForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const closed = $derived(!data.locked && data.closed);
	const questions = $derived('questions' in data && data.questions ? data.questions : []);
	const prefillName = $derived(!data.locked && !data.closed ? data.prefillName : '');
	const lockName = $derived(!data.locked && !data.closed && data.lockName);
	const reviewMode = $derived(
		!data.locked &&
			data.book &&
			'moderationMode' in data.book &&
			data.book.moderationMode === 'review'
	);

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
		<EntryForm
			token={data.token}
			{questions}
			action="?/submit"
			submitLabel="Eintrag abschließen"
			initial={{ displayName: prefillName }}
			{lockName}
			moderationHint={reviewMode}
			{message}
		/>
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
