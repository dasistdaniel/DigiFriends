<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);
	let copied = $state(false);

	const reasonText: Record<'invalid' | 'expired' | 'used', string> = {
		invalid: 'Dieser Link ist ungültig.',
		expired:
			'Dieser Link ist abgelaufen. Fordere über die Wiederherstellungs-Seite einen neuen an.',
		used: 'Dieser Link wurde bereits verwendet. Fordere bei Bedarf einen neuen an.'
	};

	async function copy(value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			copied = false;
		}
	}
</script>

<svelte:head>
	<title>Admin-Link wiederherstellen</title>
</svelte:head>

<main>
	<section class="panel">
		{#if form?.redeemed?.ok}
			<h1>Neuer Admin-Link für „{form.redeemed.bookTitle}"</h1>
			<p class="lead">
				Der alte Admin-Link ist ab sofort ungültig. Bewahre diesen neuen Link gut auf – es gibt
				keine Anmeldung, über die du ihn später wiederfinden könntest.
			</p>
			<div class="linkbox">
				<code>{form.redeemed.adminLink}</code>
				<button type="button" onclick={() => form.redeemed?.ok && copy(form.redeemed.adminLink)}>
					{copied ? 'Kopiert' : 'Kopieren'}
				</button>
			</div>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- vollständige Buch-URL -->
			<a class="cta" href={form.redeemed.adminLink} data-sveltekit-reload>Zum Admin-Bereich</a>
		{:else if form?.redeemed && !form.redeemed.ok}
			<h1>Link ungültig</h1>
			<p class="lead">{reasonText[form.redeemed.reason]}</p>
		{:else if data.check.ok}
			<h1>Neuen Admin-Link erzeugen?</h1>
			<p class="lead">
				Für „{data.check.bookTitle}" wurde eine Wiederherstellung angefordert. Wenn du bestätigst,
				wird ein neuer Admin-Link erzeugt und der alte ungültig gemacht.
			</p>
			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
			>
				<button class="cta" type="submit" disabled={submitting}>
					{submitting ? 'Wird erzeugt …' : 'Neuen Admin-Link erzeugen'}
				</button>
			</form>
		{:else}
			<h1>Link ungültig</h1>
			<p class="lead">{reasonText[data.check.reason]}</p>
		{/if}
	</section>
</main>

<style>
	main {
		max-width: 34rem;
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
	}
	form {
		margin-top: 1.4rem;
	}
	.linkbox {
		margin: 1.2rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		border: 1px solid var(--surface-line);
		border-radius: 6px;
		padding: 0.8rem 0.9rem;
		background: var(--paper-100);
	}
	.linkbox code {
		font-size: var(--step--1);
		word-break: break-all;
		color: var(--ink-700);
	}
	.linkbox button {
		align-self: flex-start;
		border: 1px solid var(--surface-line);
		background: var(--surface);
		border-radius: 999px;
		padding: 0.3rem 0.9rem;
		font-family: var(--font-label);
		font-size: var(--step--1);
		cursor: pointer;
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
</style>
