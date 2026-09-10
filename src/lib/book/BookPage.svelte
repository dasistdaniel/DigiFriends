<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		side = 'left',
		number,
		ornaments,
		children
	}: {
		side?: 'left' | 'right';
		number?: number;
		/** dekorative Ebene hinter dem Text (Blätter, Bäume …) */
		ornaments?: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="page page--{side}" data-side={side}>
	<div class="page__grain" aria-hidden="true"></div>
	{#if ornaments}
		<div class="page__ornaments" aria-hidden="true">{@render ornaments()}</div>
	{/if}
	<div class="page__content">
		{@render children()}
	</div>
	{#if number !== undefined}
		<span class="page__number">{number}</span>
	{/if}
</div>

<style>
	.page {
		position: relative;
		overflow: hidden;
		padding: clamp(1.4rem, 1rem + 3vw, 3rem);
		background:
			radial-gradient(
				120% 100% at 50% 0%,
				var(--paper-100),
				var(--paper-200) 60%,
				var(--paper-300)
			),
			var(--paper-200);
		color: var(--ink-900);
		display: flex;
		flex-direction: column;
	}

	/* Schatten zur Bindung hin */
	.page--left {
		border-radius: var(--radius-page);
		box-shadow: inset -26px 0 34px -26px var(--shadow-page);
	}
	.page--right {
		border-radius: 10px 3px 3px 10px;
		box-shadow: inset 26px 0 34px -26px var(--shadow-page);
	}

	.page__grain {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.5;
		mix-blend-mode: multiply;
		background-image:
			repeating-linear-gradient(90deg, transparent 0 3px, rgba(120, 96, 60, 0.035) 3px 4px),
			radial-gradient(circle at 20% 30%, rgba(120, 96, 60, 0.06), transparent 45%),
			radial-gradient(circle at 82% 74%, rgba(120, 96, 60, 0.05), transparent 40%);
	}

	.page__ornaments {
		position: absolute;
		inset: 0;
		pointer-events: none;
		color: var(--ochre);
		opacity: 0.5;
	}

	.page__content {
		position: relative;
		flex: 1;
		min-height: 0;
	}

	.page__number {
		position: absolute;
		bottom: 0.9rem;
		font-family: var(--font-label);
		font-size: var(--step--1);
		color: var(--ink-300);
	}
	.page--left .page__number {
		left: clamp(1.4rem, 1rem + 3vw, 3rem);
	}
	.page--right .page__number {
		right: clamp(1.4rem, 1rem + 3vw, 3rem);
	}
</style>
