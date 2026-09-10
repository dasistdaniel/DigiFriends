<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.book.title}</title></svelte:head>

<main>
	<p class="label">Leseansicht</p>
	<h1>{data.book.title}</h1>
	{#if data.book.subtitle}<p class="sub">{data.book.subtitle}</p>{/if}
	<p class="todo">Die Buch-Leseansicht mit echten Einträgen folgt als nächster Schritt.</p>
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
	.sub {
		color: var(--ink-500);
	}
	.todo {
		margin-top: 2rem;
		color: var(--ink-300);
	}
</style>
