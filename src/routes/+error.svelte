<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>{page.status} · Freundebuch</title></svelte:head>

<main>
	<p class="code">{page.status}</p>
	<h1>{page.error?.message ?? 'Etwas ist schiefgelaufen.'}</h1>
	<p><a href={resolve('/')}>Zur Startseite</a></p>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 0.6rem;
		max-width: 34rem;
		margin: 0 auto;
		padding: clamp(3rem, 12vh, 7rem) 16px;
	}
	.code {
		font-family: var(--font-label);
		font-size: var(--step-1);
		color: var(--ochre-deep);
		letter-spacing: 0.08em;
		margin: 0;
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		margin: 0;
	}
</style>
