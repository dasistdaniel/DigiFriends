<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let {
		title,
		subtitle,
		pageCount,
		page,
		theme = 'klassisch',
		open = $bindable(false),
		startPage = 0,
		onnavigate
	}: {
		title: string;
		subtitle?: string;
		/** Anzahl der Innenseiten ab der ersten linken Seite nach dem Aufschlagen */
		pageCount: number;
		/** rendert die Innenseite mit gegebenem Index */
		page: Snippet<[number]>;
		/** Einband-/Akzentfarben, siehe $lib/bookThemes */
		theme?: string;
		open?: boolean;
		startPage?: number;
		onnavigate?: (leaf: number) => void;
	} = $props();

	function clamp(n: number) {
		return Math.max(0, Math.min(n, Math.max(0, pageCount - 1)));
	}

	// startPage nur als Startwert übernehmen, danach lokal steuern
	let leaf = $state(untrack(() => clamp(startPage)));
	let perView = $state(2);
	let dir = $state(1);
	let reduced = $state(false);

	const viewStart = $derived(perView === 2 ? leaf - (leaf % 2) : leaf);
	const visible = $derived(
		Array.from({ length: perView }, (_, i) => viewStart + i).filter((i) => i < pageCount)
	);
	const atStart = $derived(viewStart <= 0);
	const atEnd = $derived(viewStart + perView >= pageCount);
	/** Zeigt beim Schließen die Rückseite, wenn man wirklich bis zum Ende geblättert hat. */
	const closedFace = $derived(atEnd && !atStart ? 'back' : 'front');
	const totalSpreads = $derived(Math.ceil(pageCount / perView));
	const currentSpread = $derived(Math.floor(viewStart / perView) + 1);
	const dur = $derived(reduced ? 0 : 340);

	$effect(() => {
		const mqWide = window.matchMedia('(min-width: 900px)');
		const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			perView = mqWide.matches ? 2 : 1;
			reduced = mqMotion.matches;
		};
		sync();
		mqWide.addEventListener('change', sync);
		mqMotion.addEventListener('change', sync);
		return () => {
			mqWide.removeEventListener('change', sync);
			mqMotion.removeEventListener('change', sync);
		};
	});

	export function goto(target: number) {
		const next = clamp(perView === 2 ? target - (target % 2) : target);
		dir = next >= leaf ? 1 : -1;
		leaf = next;
		onnavigate?.(leaf);
	}
	/** Am Buchende schließt der Weiter-Pfeil das Buch, statt untätig zu bleiben. */
	function next() {
		if (!atEnd) goto(viewStart + perView);
		else open = false;
	}
	/** Am Buchanfang schließt der Zurück-Pfeil das Buch, statt untätig zu bleiben. */
	function prev() {
		if (!atStart) goto(viewStart - perView);
		else open = false;
	}

	function onkeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowRight' || e.key === 'PageDown') {
			next();
			e.preventDefault();
		} else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
			prev();
			e.preventDefault();
		}
	}

	let swipeX = 0;
	function onpointerdown(e: PointerEvent) {
		if (e.pointerType === 'mouse') return;
		swipeX = e.clientX;
	}
	function onpointerup(e: PointerEvent) {
		if (e.pointerType === 'mouse' || !swipeX) return;
		const dx = e.clientX - swipeX;
		swipeX = 0;
		if (dx < -45) next();
		else if (dx > 45) prev();
	}
</script>

<svelte:window {onkeydown} />

{#if !open}
	<div class="stage stage--closed" data-book-theme={theme}>
		{#if closedFace === 'back'}
			<button
				type="button"
				class="cover cover--back"
				onclick={() => (open = true)}
				aria-label="Buch wieder aufschlagen"
			>
				<span class="cover__edge" aria-hidden="true"></span>
				<span class="cover__spine" aria-hidden="true"></span>
				<span class="cover__blurb">
					<span class="cover__ornament" aria-hidden="true">✦</span>
					<span class="cover__blurb-text">Gemeinsame Erinnerungen, gesammelt in einem Buch.</span>
				</span>
				<p class="cover__thanks hand">Danke, dass du DigiFriends nutzt!</p>
				<span class="cover__hint label">Weiterlesen</span>
			</button>
		{:else}
			<button
				type="button"
				class="cover"
				onclick={() => (open = true)}
				aria-label="Buch aufschlagen"
			>
				<span class="cover__edge" aria-hidden="true"></span>
				<span class="cover__spine" aria-hidden="true"></span>
				<span class="cover__plate">
					<span class="cover__ornament" aria-hidden="true">✦</span>
					<span class="cover__title">{title}</span>
					{#if subtitle}<span class="cover__subtitle">{subtitle}</span>{/if}
				</span>
				<span class="cover__hint label">Aufschlagen</span>
			</button>
		{/if}
	</div>
{:else}
	<div class="stage" data-book-theme={theme}>
		<div
			class="book"
			class:book--single={perView === 1}
			role="group"
			aria-roledescription="Buch"
			aria-label={title}
			{onpointerdown}
			{onpointerup}
		>
			<div class="book__spread">
				{#key viewStart}
					<div
						class="book__pages"
						in:fly={{ x: dir * 60, duration: dur, easing: cubicOut, opacity: 0 }}
						out:fly={{ x: dir * -40, duration: dur, easing: cubicOut, opacity: 0 }}
					>
						{#each visible as pageIndex (pageIndex)}
							{@render page(pageIndex)}
						{/each}
						{#if perView === 2 && visible.length === 1}
							<div class="book__blank" aria-hidden="true"></div>
						{/if}
					</div>
				{/key}
				<div class="book__binding" aria-hidden="true"></div>
			</div>

			<button
				type="button"
				class="nav nav--prev"
				onclick={prev}
				aria-label={atStart ? 'Buch schließen' : 'Zurückblättern'}
			>
				‹
			</button>
			<button
				type="button"
				class="nav nav--next"
				onclick={next}
				aria-label={atEnd ? 'Buch schließen' : 'Weiterblättern'}
			>
				›
			</button>
		</div>

		<div class="toolbar">
			<button type="button" class="toolbar__btn" onclick={() => goto(0)} disabled={atStart}>
				Inhaltsverzeichnis
			</button>
			<span class="toolbar__progress label" aria-live="polite">
				Seite {currentSpread} / {totalSpreads}
			</span>
			<button type="button" class="toolbar__btn" onclick={() => (open = false)}>
				Buch schließen
			</button>
		</div>
	</div>
{/if}

<style>
	.stage {
		/* gemeinsame Bezugsgröße für Cover und aufgeschlagenes Buch */
		--book-max: 76rem;
		--stage-pad: clamp(1rem, 4vw, 3rem);
		/* Höhe der Toolbar + Abstand zum Buch, damit das Buch bei knapper Bildschirmhöhe nicht überläuft */
		--toolbar-block: 3.6rem;
		--avail-h: calc(100vh - var(--footer-h) - 2 * var(--stage-pad) - var(--toolbar-block));
		/* Breite so groß wie möglich, aber weder breiter noch höher als der sichtbare Bereich */
		--spread-w: min(96vw, var(--book-max), calc(var(--avail-h) * 2 / 1.34));
		--spread-w-single: min(96vw, 34rem, calc(var(--avail-h) / 1.36));

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.2rem;
		width: 100%;
		min-height: 100%;
		padding: var(--stage-pad) 16px;
		background: radial-gradient(120% 80% at 50% 0%, transparent, var(--room-vignette));

		/* Einband-Theme (Standard = klassisches Leder), überschrieben je data-book-theme unten */
		--cover-gradient: linear-gradient(180deg, var(--leather-700), var(--leather-900));
		--cover-sheen: rgba(255, 240, 220, 0.16);
		--cover-sheen-soft: rgba(255, 240, 220, 0.08);
		--cover-ink: rgba(247, 241, 225, 0.94);
		--cover-title-shadow: none;
	}

	/* ------------------------------------------------------- Einband-Themes */
	.stage[data-book-theme='regenbogen'] {
		--cover-gradient: linear-gradient(
			135deg,
			#e63950 0%,
			#e63950 16.6%,
			#f2994a 16.6%,
			#f2994a 33.2%,
			#f2c94c 33.2%,
			#f2c94c 49.8%,
			#27ae60 49.8%,
			#27ae60 66.4%,
			#2f80ed 66.4%,
			#2f80ed 83%,
			#9b51e0 83%,
			#9b51e0 100%
		);
		--cover-sheen: rgba(255, 255, 255, 0.32);
		--cover-sheen-soft: rgba(255, 255, 255, 0.16);
		--cover-ink: #fffaf0;
		--cover-title-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
		--ochre: #f2994a;
		--ochre-deep: #d6336c;
		/* Warmes, helles Fest-Papier statt gealtertem Sepia – passend zu "bunt und fröhlich" */
		--paper-100: #fff8f0;
		--paper-200: #ffeedd;
		--paper-300: #ffdfc2;
		--paper-edge: #ffc998;
		--paper-line: #f5a85f;
		--paper-grain-rgb: 150, 90, 40;
	}
	.stage[data-book-theme='ozean'] {
		--cover-gradient: linear-gradient(180deg, #1f6f78, #123b42);
		--cover-sheen: rgba(255, 255, 255, 0.14);
		--cover-sheen-soft: rgba(255, 255, 255, 0.07);
		--cover-ink: rgba(238, 250, 250, 0.94);
		--ochre: #3fb8c4;
		--ochre-deep: #1f8a94;
		/* Frisches, klares Papier statt Sepia – passend zu "modern und klar" */
		--paper-100: #f3fbfb;
		--paper-200: #e4f4f4;
		--paper-300: #cfe9ea;
		--paper-edge: #a9d8da;
		--paper-line: #8ec7ca;
		--paper-grain-rgb: 25, 80, 85;
	}
	.stage[data-book-theme='mitternacht'] {
		--cover-gradient: linear-gradient(180deg, #1b2340, #0a0e1f);
		--cover-sheen: rgba(255, 221, 150, 0.12);
		--cover-sheen-soft: rgba(255, 221, 150, 0.06);
		--cover-ink: #f4e3b2;
		--ochre: #d4af37;
		--ochre-deep: #b8892f;
		/* Edles Creme-Gold-Papier statt Leder-Sepia – passend zu "edel und ruhig" */
		--paper-100: #faf4e3;
		--paper-200: #f2e7c8;
		--paper-300: #e6d3a0;
		--paper-edge: #d4b96a;
		--paper-line: #c2a44e;
		--paper-grain-rgb: 130, 100, 40;
	}

	/* ---------------------------------------------------------------- Cover */
	/* Geschlossen = eine Buchseite: gleiche Höhe wie das aufgeschlagene Buch,
	   halbe Breite der Doppelseite. */
	.cover {
		position: relative;
		width: min(92vw, 30rem);
		aspect-ratio: 1 / 1.34;
		border: 0;
		padding: 0;
		cursor: pointer;
		border-radius: 6px 12px 12px 6px;
		background: linear-gradient(115deg, var(--cover-sheen), transparent 42%), var(--cover-gradient);
		box-shadow:
			0 2px 0 var(--cover-sheen-soft) inset,
			0 26px 50px -18px var(--shadow-book);
		color: var(--cover-ink);
		transition:
			transform 0.35s var(--cubic, ease),
			box-shadow 0.35s ease;
	}
	.cover:hover,
	.cover:focus-visible {
		transform: translateY(-3px) rotate(-0.4deg);
		box-shadow: 0 34px 60px -18px var(--shadow-book);
	}
	@media (min-width: 900px) {
		.cover {
			width: calc(var(--spread-w) / 2);
		}
	}
	.cover__spine {
		position: absolute;
		inset: 0 auto 0 0;
		width: 16px;
		border-radius: 6px 0 0 6px;
		background: linear-gradient(90deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.05));
	}
	.cover__edge {
		position: absolute;
		inset: 8px -6px 8px auto;
		width: 8px;
		border-radius: 0 3px 3px 0;
		background: repeating-linear-gradient(
			180deg,
			var(--paper-200) 0 2px,
			var(--paper-edge) 2px 3px
		);
	}
	/* Titel als aufgeklebter weißer Sticker – wirkt auf jedem Einband-Theme gut,
	   deshalb bewusst nicht themenabhängig gefärbt. */
	.cover__plate {
		position: absolute;
		inset: 16% 12% auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: clamp(1.2rem, 0.9rem + 2.6vw, 2.1rem) 1.2rem;
		background: #fdfcf8;
		border-radius: 8px;
		box-shadow:
			0 14px 26px -12px rgba(0, 0, 0, 0.4),
			0 2px 5px rgba(0, 0, 0, 0.18);
		transform: rotate(-1.4deg);
		color: var(--ink-900);
	}
	.cover__ornament {
		font-size: 1.4rem;
		color: var(--ochre-deep);
	}
	.cover__title {
		font-family: var(--font-hand);
		font-size: var(--step-3);
		font-weight: 700;
		text-align: center;
		line-height: 1.1;
	}
	.cover__subtitle {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: var(--step--1);
		color: var(--ink-500);
	}
	.cover__hint {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 8%;
		text-align: center;
		font-size: var(--step--1);
		letter-spacing: 0.14em;
		opacity: 0.7;
		text-shadow: var(--cover-title-shadow);
	}

	/* ------------------------------------------------------------ Rückseite */
	.cover__blurb {
		position: absolute;
		inset: 16% 16% auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		text-align: center;
	}
	.cover__blurb-text {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.03em;
		line-height: 1.6;
		color: var(--cover-ink);
		text-shadow: var(--cover-title-shadow);
		opacity: 0.85;
	}
	/* Danke-Sticker: gleiche Machart wie der Titel-Sticker auf der Vorderseite. */
	.cover__thanks {
		position: absolute;
		inset: auto 14% 20%;
		margin: 0;
		background: #fdfcf8;
		border-radius: 6px;
		padding: 0.6rem 1.1rem;
		box-shadow:
			0 10px 20px -10px rgba(0, 0, 0, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.15);
		transform: rotate(1.6deg);
		color: var(--ink-900);
		text-align: center;
		font-size: var(--step-0);
	}

	/* ----------------------------------------------------------------- Book */
	.book {
		position: relative;
		width: var(--spread-w);
	}
	.book--single {
		width: var(--spread-w-single);
	}
	.book__spread {
		position: relative;
		aspect-ratio: 2 / 1.34;
		border-radius: 6px;
		box-shadow: 0 30px 60px -22px var(--shadow-book);
		overflow: hidden;
	}
	.book--single .book__spread {
		aspect-ratio: 1 / 1.36;
		max-width: var(--spread-w-single);
		margin-inline: auto;
	}
	.book__pages {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.book--single .book__pages {
		grid-template-columns: 1fr;
	}
	.book__blank {
		background: var(--paper-300);
	}
	.book__binding {
		position: absolute;
		inset: 0 auto 0 50%;
		width: 30px;
		transform: translateX(-50%);
		pointer-events: none;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(58, 32, 21, 0.16) 42%,
			rgba(58, 32, 21, 0.28) 50%,
			rgba(58, 32, 21, 0.16) 58%,
			transparent
		);
	}
	.book--single .book__binding {
		display: none;
	}

	.nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 2.6rem;
		height: 2.6rem;
		display: grid;
		place-items: center;
		font-size: 1.7rem;
		line-height: 1;
		border-radius: 50%;
		border: 1px solid var(--surface-line);
		background: var(--surface);
		color: var(--ink-700);
		cursor: pointer;
		box-shadow: 0 6px 16px -8px var(--shadow-book);
	}
	.nav--prev {
		left: -0.6rem;
	}
	.nav--next {
		right: -0.6rem;
	}
	@media (min-width: 640px) {
		.nav--prev {
			left: -1.4rem;
		}
		.nav--next {
			right: -1.4rem;
		}
	}

	/* -------------------------------------------------------------- Toolbar */
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem 0.6rem;
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 999px;
		padding: 0.35rem 0.6rem;
		box-shadow: 0 8px 20px -12px var(--shadow-book);
	}
	.toolbar__btn {
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink-700);
		padding: 0.35rem 0.8rem;
		border-radius: 999px;
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.04em;
		cursor: pointer;
	}
	.toolbar__btn:hover:not(:disabled) {
		border-color: var(--surface-line);
		background: var(--paper-100);
	}
	.toolbar__btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.toolbar__progress {
		color: var(--ink-500);
		font-size: var(--step--1);
		font-variant-numeric: tabular-nums;
	}
</style>
