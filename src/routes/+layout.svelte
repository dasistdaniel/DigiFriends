<script lang="ts">
	import '$lib/styles/global.css';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import DeskProps from '$lib/DeskProps.svelte';

	let { children } = $props();
</script>

<DeskProps />

{@render children()}

<SiteFooter />
