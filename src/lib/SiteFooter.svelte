<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="site-footer">
	<span>Ein privates, nicht-kommerzielles Projekt</span>
	<nav>
		<a href="https://github.com/dasistdaniel/DigiFriends" target="_blank" rel="noopener">GitHub</a>
		<a href={resolve('/wiederherstellen')}>Admin-Zugang verloren?</a>
		<a href={resolve('/impressum')}>Impressum</a>
		<a href={resolve('/datenschutz')}>Datenschutz</a>
	</nav>
</footer>

<style>
	.site-footer {
		position: fixed;
		inset: auto 0 0 0;
		z-index: 30;
		min-height: var(--footer-h);
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.3rem 1rem;
		padding: 0.7rem 16px;
		background: var(--surface);
		border-top: 1px solid var(--surface-line);
		font-family: var(--font-label);
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--ink-500);
		box-shadow: 0 -8px 18px -14px var(--shadow-book);
	}
	@media (max-width: 480px) {
		.site-footer {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
	nav {
		display: flex;
		gap: 0.9rem;
	}
	a {
		color: var(--ink-700);
	}
</style>
