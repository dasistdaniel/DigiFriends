<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.book.title} · verwalten</title></svelte:head>

<main>
	<p class="label">Admin-Bereich</p>
	<h1>{data.book.title}</h1>
	<ul>
		<li>Vorlage: {data.book.moderationMode === 'review' ? 'Freigabe nötig' : 'sofort sichtbar'}</li>
		<li>Status: {data.book.status}</li>
	</ul>
	<p><a href={resolve('/b/[token]/lesen', { token: data.token })}>Buch ansehen</a></p>
	<p class="todo">
		Fragen-Editor, Design-Optionen, Einträge-Moderation und Link-Verwaltung folgen.
	</p>
</main>

<style>
	main {
		max-width: 40rem;
		margin: 0 auto;
		padding: clamp(2.5rem, 8vh, 5rem) 16px;
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-2);
	}
	.todo {
		margin-top: 2rem;
		color: var(--ink-300);
	}
</style>
