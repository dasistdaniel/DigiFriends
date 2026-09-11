<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="site-footer">
	<span>Ein privates, nicht-kommerzielles Projekt</span>
	<nav>
		<a href={resolve('/impressum')}>Impressum</a>
		<a href={resolve('/datenschutz')}>Datenschutz</a>
	</nav>
</footer>

<style>
	.site-footer {
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
	}
	nav {
		display: flex;
		gap: 0.9rem;
	}
	a {
		color: var(--ink-700);
	}
</style>
