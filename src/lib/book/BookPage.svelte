<script lang="ts">
	import type { Snippet } from 'svelte';

	/** dezente Eckdoodles, die auf jeder Seite ohne eigene Ornamente erscheinen */
	const doodlePaths = [
		// Herz
		'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
		// Stern
		'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z',
		// Funkeln
		'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zM11.5 9.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z',
		// Blatt
		'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z',
		// Papierflieger
		'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'
	];

	/** Regenbogen-Theme: Eckdoodles wechseln die Farbe statt einheitlich ockerfarben zu sein. */
	const RAINBOW = ['#e63950', '#f2994a', '#f2c94c', '#27ae60', '#2f80ed', '#9b51e0'];

	let {
		side = 'left',
		number,
		theme,
		ornaments,
		plain = false,
		children
	}: {
		side?: 'left' | 'right';
		number?: number;
		/** Buch-Theme (s. $lib/bookThemes) – steuert nur die Eckdoodle-Farbe (Regenbogen) */
		theme?: string;
		/** dekorative Ebene hinter dem Text (Blätter, Bäume …); ohne Angabe erscheint ein Eckdoodle */
		ornaments?: Snippet;
		/** ohne Papier-Verlauf/Maserung - fuer den Druck-Export (spart Tinte, druckt sauberer) */
		plain?: boolean;
		children: Snippet;
	} = $props();

	const doodleSeed = $derived(number ?? 0);
	const doodlePath = $derived(
		doodlePaths[((doodleSeed % doodlePaths.length) + doodlePaths.length) % doodlePaths.length]
	);
	const doodleRotate = $derived(((doodleSeed * 37) % 24) - 12);
	const doodleColor = $derived(
		theme === 'regenbogen'
			? RAINBOW[((doodleSeed % RAINBOW.length) + RAINBOW.length) % RAINBOW.length]
			: undefined
	);
</script>

<div class="page page--{side}" class:page--plain={plain} data-side={side}>
	{#if !plain}<div class="page__grain" aria-hidden="true"></div>{/if}
	{#if ornaments}
		<div class="page__ornaments" aria-hidden="true">{@render ornaments()}</div>
	{:else}
		<svg
			class="page__doodle"
			viewBox="0 0 24 24"
			aria-hidden="true"
			style:transform={`rotate(${doodleRotate}deg)`}
			style:color={doodleColor}
		>
			<path d={doodlePath} />
		</svg>
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

	.page--plain {
		background: #fff;
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
			repeating-linear-gradient(
				90deg,
				transparent 0 3px,
				rgba(var(--paper-grain-rgb), 0.035) 3px 4px
			),
			radial-gradient(circle at 20% 30%, rgba(var(--paper-grain-rgb), 0.06), transparent 45%),
			radial-gradient(circle at 82% 74%, rgba(var(--paper-grain-rgb), 0.05), transparent 40%);
	}

	.page__ornaments {
		position: absolute;
		inset: 0;
		pointer-events: none;
		color: var(--ochre);
		opacity: 0.5;
	}

	.page__doodle {
		position: absolute;
		top: clamp(0.9rem, 3vw, 1.7rem);
		width: clamp(1.5rem, 1.2rem + 1.5vw, 2.1rem);
		height: clamp(1.5rem, 1.2rem + 1.5vw, 2.1rem);
		fill: currentColor;
		color: var(--ochre);
		opacity: 0.34;
		pointer-events: none;
	}
	.page--left .page__doodle {
		left: clamp(0.9rem, 3vw, 1.7rem);
	}
	.page--right .page__doodle {
		right: clamp(0.9rem, 3vw, 1.7rem);
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
