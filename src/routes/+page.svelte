<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<main>
	<h1>Digitales Freundebuch</h1>
	<p>Ein Freundebuch, das sich im Browser aufschlagen und durchblättern lässt.</p>
	<p><a href={resolve('/demo')}>Buch-Demo ansehen</a></p>
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
</style>
