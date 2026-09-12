<script lang="ts">
	import '$lib/styles/global.css';
	import SiteFooter from '$lib/SiteFooter.svelte';

	let { children } = $props();
</script>

{@render children()}

<SiteFooter />
