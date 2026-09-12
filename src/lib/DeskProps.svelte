<!--
	Ein paar Gegenstände auf dem Schreibtisch, damit die Fläche um das Buch
	nicht so leer wirkt. Nur auf breiten Bildschirmen sichtbar, wo tatsächlich
	Tischfläche neben dem Inhalt frei bleibt.
-->
<div class="desk-props" aria-hidden="true">
	<svg class="desk-prop desk-prop--coffee" viewBox="0 0 80 80">
		<ellipse cx="40" cy="62" rx="26" ry="5" fill="#2c2015" opacity="0.18" />
		<path
			d="M25 34c1-2 3-3 5-3h20c2 0 4 1 5 3l-3 20c-0.5 4-4 7-8 7H36c-4 0-7.5-3-8-7z"
			fill="#f3ead8"
			stroke="#d8c7a0"
			stroke-width="1.5"
		/>
		<path d="M55 39c5-1 9 2 9 6s-4 7-9 6" fill="none" stroke="#d8c7a0" stroke-width="3" />
		<ellipse cx="40" cy="35" rx="13.5" ry="3.5" fill="#5b3a24" />
		<path
			d="M31 21c-2-3 1-5-1-9M40 20c-2-3 1-5-1-9M49 21c-2-3 1-5-1-9"
			stroke="#c8b79a"
			stroke-width="2.2"
			fill="none"
			stroke-linecap="round"
			opacity="0.75"
		/>
	</svg>

	<svg class="desk-prop desk-prop--pen" viewBox="0 0 100 40">
		<ellipse cx="52" cy="33" rx="34" ry="4" fill="#2c2015" opacity="0.14" />
		<g transform="rotate(-18 50 20)">
			<rect x="14" y="16" width="62" height="9" rx="4.5" fill="#6e2f2a" />
			<rect x="14" y="16" width="62" height="3.4" rx="1.7" fill="#8a4540" />
			<path d="M76 16l10 4.5-10 4.5z" fill="#2c2620" />
			<rect x="24" y="13" width="10" height="4" rx="1.3" fill="#d8c7a0" />
		</g>
	</svg>

	<svg class="desk-prop desk-prop--plant" viewBox="0 0 80 80">
		<ellipse cx="40" cy="66" rx="24" ry="5" fill="#2c2015" opacity="0.18" />
		<path d="M22 45h36l-4 20c-0.5 2.5-2.5 4-5 4H31c-2.5 0-4.5-1.5-5-4z" fill="#a9642c" />
		<rect x="20" y="41" width="40" height="7" rx="2.5" fill="#c07a3a" />
		<path d="M40 45c0-10-8-16-16-18 2 9 8 15 16 18z" fill="#6f7d5f" />
		<path d="M40 45c0-13 9-20 18-22-1 11-8 19-18 22z" fill="#7f8f68" />
		<path d="M40 45c-1-8-6-13-12-15 1 7 5 12 12 15z" fill="#586b45" />
		<path d="M40 45c1-9 5-15 11-18-0.5 8-4 15-11 18z" fill="#5c7048" />
	</svg>
</div>

<style>
	.desk-props {
		display: none;
	}

	/* Nur zeigen, wenn neben dem breitesten Inhalt (Buch, 76rem) sicher noch
	   Tischfläche übrig bleibt. */
	@media (min-width: 1500px) {
		.desk-props {
			display: contents;
		}
	}

	.desk-prop {
		position: fixed;
		bottom: calc(var(--footer-h) + 14px);
		z-index: -1;
		pointer-events: none;
		filter: drop-shadow(0 6px 10px rgba(20, 12, 6, 0.25));
	}
	.desk-prop--coffee {
		left: 28px;
		width: 84px;
		height: 84px;
	}
	.desk-prop--pen {
		left: 128px;
		width: 104px;
		height: 42px;
		transform: rotate(-3deg);
	}
	.desk-prop--plant {
		right: 28px;
		width: 88px;
		height: 88px;
	}
</style>
