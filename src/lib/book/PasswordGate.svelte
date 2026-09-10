<script lang="ts">
	import { page } from '$app/state';

	let {
		token,
		bookTitle,
		failed = false
	}: { token: string; bookTitle: string; failed?: boolean } = $props();

	function focusOnMount(node: HTMLInputElement) {
		node.focus();
	}
</script>

<main>
	<section class="gate">
		<p class="label">Geschützt</p>
		<h1>{bookTitle}</h1>
		<p>Dieser Link ist mit einem Passwort geschützt.</p>

		<form method="POST" action="/b/{token}">
			<input type="hidden" name="redirectTo" value={page.url.pathname} />
			<label>
				<span class="visually-hidden">Passwort</span>
				<input
					name="password"
					type="password"
					required
					autocomplete="current-password"
					placeholder="Passwort"
					use:focusOnMount
				/>
			</label>
			{#if failed}<p class="err">Passwort stimmt nicht.</p>{/if}
			<button type="submit">Öffnen</button>
		</form>
	</section>
</main>

<style>
	main {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 16px;
	}
	.gate {
		width: min(100%, 24rem);
		background: var(--surface);
		border: 1px solid var(--surface-line);
		border-radius: 8px;
		padding: clamp(1.4rem, 1rem + 3vw, 2.4rem);
		box-shadow: 0 20px 44px -28px var(--shadow-book);
	}
	h1 {
		font-family: var(--font-hand);
		font-size: var(--step-2);
		margin: 0.2rem 0 0.6rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		margin-top: 1.2rem;
	}
	input[type='password'] {
		width: 100%;
		border: 1px solid var(--surface-line);
		background: var(--paper-100);
		border-radius: 5px;
		padding: 0.55rem 0.7rem;
		font: inherit;
	}
	.err {
		color: var(--danger);
		font-size: var(--step--1);
		margin: 0;
	}
	button {
		align-self: flex-start;
		background: var(--oxblood);
		color: var(--paper-100);
		border: 0;
		border-radius: 999px;
		padding: 0.55rem 1.3rem;
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: var(--step--1);
		cursor: pointer;
	}
</style>
