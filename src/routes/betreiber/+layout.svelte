<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const current = $derived(page.url.pathname);
	const booksHref = resolve('/betreiber');
	const statsHref = resolve('/betreiber/statistik');
</script>

<svelte:head><title>Betreiber-Bereich</title></svelte:head>

{#if data.authenticated}
	<div class="wrap">
		<header class="bar">
			<span class="label">Betreiber-Bereich</span>
			<form method="POST" action="{booksHref}?/logout">
				<button class="link-btn" type="submit">Abmelden</button>
			</form>
		</header>

		<nav class="tabs">
			<a class="tab" class:tab--on={current === booksHref} href={booksHref}>Bücher</a>
			<a class="tab" class:tab--on={current === statsHref} href={statsHref}>Statistik</a>
		</nav>

		<main class="body">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.wrap {
		max-width: 60rem;
		margin: clamp(1rem, 4vw, 3rem) auto;
		padding: clamp(1.5rem, 5vw, 2.6rem);
		background: var(--paper-200);
		border: 1px solid var(--surface-line);
		border-radius: 12px;
		box-shadow: 0 24px 50px -30px var(--shadow-book);
	}
	@media (max-width: 640px) {
		.wrap {
			margin: 0;
			border-radius: 0;
			border-left: 0;
			border-right: 0;
			min-height: calc(100vh - var(--footer-h));
		}
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.link-btn {
		background: none;
		border: 0;
		padding: 0;
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.04em;
		color: var(--ink-500);
		text-decoration: underline;
		cursor: pointer;
	}
	.tabs {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
		margin: 1.4rem 0 1.8rem;
		border-bottom: 1px solid var(--surface-line);
	}
	.tab {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--ink-500);
		padding: 0.5rem 0.8rem;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}
	.tab--on {
		color: var(--ink-900);
		border-bottom-color: var(--oxblood);
	}
	.body {
		display: block;
	}
</style>
