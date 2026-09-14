<script lang="ts">
	import { page } from '$app/state';
	import PasswordGate from '$lib/book/PasswordGate.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const failed = $derived(page.url.searchParams.has('pw'));
	const rateLimited = $derived(page.url.searchParams.get('pw') === 'rate');
</script>

{#if data.locked}
	<PasswordGate token={data.token} bookTitle={data.bookTitle} {failed} {rateLimited} />
{:else}
	{@render children()}
{/if}
