<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.book.title} · eintragen</title></svelte:head>

<main>
	<p class="label">Eintragen</p>
	<h1>{data.book.title}</h1>
	<p class="todo">
		Die Schreibansicht (Doppelseite mit Feldern, Avatar, Fotos) folgt als nächster Schritt.
	</p>
</main>

<style>
	main {
		max-width: 34rem;
		margin: 0 auto;
		padding: clamp(3rem, 12vh, 7rem) 16px;
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
	}
	.todo {
		margin-top: 2rem;
		color: var(--ink-300);
	}
</style>
