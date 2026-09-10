<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const token = $derived(data.token);
	const sections = [
		{ id: 'eintraege', label: 'Einträge' },
		{ id: 'fragen', label: 'Fragen' },
		{ id: 'buch', label: 'Buch' },
		{ id: 'zugaenge', label: 'Zugänge' }
	];

	const current = $derived(page.url.pathname.split('/admin/')[1]?.split('/')[0] ?? 'eintraege');
	const viewHref = $derived(resolve('/b/[token]/lesen', { token }));

	function tabHref(section: string) {
		switch (section) {
			case 'fragen':
				return resolve('/b/[token]/admin/fragen', { token });
			case 'buch':
				return resolve('/b/[token]/admin/buch', { token });
			case 'zugaenge':
				return resolve('/b/[token]/admin/zugaenge', { token });
			default:
				return resolve('/b/[token]/admin/eintraege', { token });
		}
	}
</script>

{#if !data.locked}
	<div class="admin">
		<header class="admin__bar">
			<div class="admin__title">
				<span class="label">Verwalten</span>
				<h1>{data.adminBook?.title ?? 'Buch'}</h1>
			</div>
			<a class="admin__view" href={viewHref} target="_blank" rel="noopener">Buch ansehen ↗</a>
		</header>

		<nav class="admin__nav">
			{#each sections as s (s.id)}
				<a
					class="admin__tab"
					class:admin__tab--on={current === s.id}
					href={tabHref(s.id)}
					aria-current={current === s.id ? 'page' : undefined}
				>
					{s.label}
				</a>
			{/each}
		</nav>

		<main class="admin__body">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	.admin {
		max-width: 54rem;
		margin: clamp(1rem, 4vw, 3rem) auto;
		padding: clamp(1.5rem, 5vw, 2.6rem);
		background: var(--paper-200);
		border: 1px solid var(--surface-line);
		border-radius: 12px;
		box-shadow: 0 24px 50px -30px var(--shadow-book);
	}
	@media (max-width: 640px) {
		.admin {
			margin: 0;
			border-radius: 0;
			border-left: 0;
			border-right: 0;
			min-height: 100vh;
		}
	}
	.admin__bar {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.admin__title h1 {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		margin: 0.1rem 0 0;
	}
	.admin__view {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.admin__nav {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
		margin: 1.4rem 0 1.8rem;
		border-bottom: 1px solid var(--surface-line);
	}
	.admin__tab {
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
	.admin__tab--on {
		color: var(--ink-900);
		border-bottom-color: var(--oxblood);
	}
	.admin__body {
		display: block;
	}
</style>
