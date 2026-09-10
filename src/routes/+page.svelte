<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>Digitales Freundebuch</title></svelte:head>

<main>
	<h1>Digitales Freundebuch</h1>
	<p>
		Ein Freundebuch, das sich im Browser aufschlagen und durchblättern lässt. Ohne Konto, teilbar
		per Link.
	</p>
	<p class="actions">
		<a class="cta" href={resolve('/neu')}>Freundebuch anlegen</a>
		<a href={resolve('/demo')}>Demo ansehen</a>
	</p>
</main>

<style>
	main {
		max-width: 34rem;
		margin: 0 auto;
		padding: clamp(3rem, 12vh, 8rem) 16px;
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin-bottom: 0.5rem;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 1.2rem;
		margin-top: 1.6rem;
	}
	.cta {
		background: var(--oxblood);
		color: var(--paper-100);
		border-radius: 999px;
		padding: 0.65rem 1.3rem;
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: var(--step--1);
		text-decoration: none;
	}
</style>
