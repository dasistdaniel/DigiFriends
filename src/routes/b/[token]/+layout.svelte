<script lang="ts">
	import { page } from '$app/state';
	import PasswordGate from '$lib/book/PasswordGate.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const failed = $derived(page.url.searchParams.has('pw'));
</script>

{#if data.locked}
	<PasswordGate token={data.token} bookTitle={data.bookTitle} {failed} />
{:else}
	{@render children()}
{/if}
