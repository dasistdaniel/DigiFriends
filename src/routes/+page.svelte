<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>Digitales Freundebuch</title></svelte:head>

<main>
	<section class="card">
		<h1>Digitales Freundebuch</h1>
		<p>
			Ein Freundebuch, das sich im Browser aufschlagen und durchblättern lässt. Ohne Konto, teilbar
			per Link.
		</p>
		<p class="actions">
			<a class="cta" href={resolve('/neu')}>Freundebuch anlegen</a>
			<a href={resolve('/demo')}>Demo ansehen</a>
		</p>
	</section>
</main>

<style>
	main {
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: clamp(1.5rem, 6vw, 4rem) 16px;
	}
	.card {
		max-width: 34rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 12px;
		padding: clamp(1.6rem, 1rem + 4vw, 3rem);
		box-shadow: 0 24px 50px -30px var(--shadow-book);
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin: 0 0 0.5rem;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 1.2rem;
		margin-top: 1.6rem;
		flex-wrap: wrap;
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
