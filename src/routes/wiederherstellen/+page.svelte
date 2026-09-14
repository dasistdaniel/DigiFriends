<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let email = $state('');
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Admin-Zugang wiederherstellen</title>
</svelte:head>

<main>
	<section class="panel">
		<h1>Admin-Zugang wiederherstellen</h1>

		{#if !data.mailEnabled}
			<p class="lead">
				Die Wiederherstellung per E-Mail ist auf diesem Server aktuell noch nicht eingerichtet. Wenn
				du deinen Admin-Link verloren hast, hilft dir das hier leider (noch) nicht weiter.
			</p>
		{:else if form && 'sent' in form && form.sent}
			<p class="lead">
				Falls diese Adresse bei einem Buch als Wiederherstellungs-Adresse hinterlegt ist, bekommst
				du in Kürze eine E-Mail mit einem Link, über den du dir einen neuen Admin-Link erzeugen
				kannst. Der alte Admin-Link wird dabei ungültig.
			</p>
		{:else}
			<p class="lead">
				Trag die E-Mail-Adresse ein, die beim Anlegen deines Freundebuchs als
				Wiederherstellungs-Adresse hinterlegt wurde. Du bekommst dann einen Link, über den du dir
				einen neuen Admin-Link erzeugen kannst.
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
					<span class="label">E-Mail-Adresse</span>
					<input type="email" name="email" required maxlength="200" bind:value={email} />
				</label>
				{#if form && 'message' in form}<p class="err">{form.message}</p>{/if}
				<button class="cta" type="submit" disabled={submitting}>
					{submitting ? 'Wird gesendet …' : 'Link anfordern'}
				</button>
			</form>
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
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		margin-top: 1.4rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.label {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-size: var(--step--1);
		color: var(--ink-700);
	}
	input {
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.55rem 0.7rem;
		font-family: var(--font-body);
		font-size: var(--step-0);
	}
	.err {
		font-size: var(--step--1);
		color: var(--danger);
		margin: 0;
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
	}
	.cta:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
