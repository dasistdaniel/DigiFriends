<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>{page.status} · Freundebuch</title></svelte:head>

<main>
	<section class="card">
		<p class="code">{page.status}</p>
		<h1>{page.error?.message ?? 'Etwas ist schiefgelaufen.'}</h1>
		<p><a href={resolve('/')}>Zur Startseite</a></p>
	</section>
</main>

<style>
	main {
		min-height: calc(100vh - var(--footer-h));
		display: grid;
		place-items: center;
		padding: clamp(1.5rem, 6vw, 4rem) 16px;
	}
	.card {
		max-width: 32rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 12px;
		padding: clamp(1.6rem, 1rem + 4vw, 3rem);
		box-shadow: 0 24px 50px -30px var(--shadow-book);
	}
	.code {
		font-family: var(--font-label);
		font-size: var(--step-1);
		color: var(--ochre-deep);
		letter-spacing: 0.08em;
		margin: 0 0 0.3rem;
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		margin: 0 0 0.8rem;
	}
</style>
