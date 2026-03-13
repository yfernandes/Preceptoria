<script lang="ts">
	import { onMount } from "svelte";
	import { inject } from "@vercel/analytics";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();

	onMount(() => {
		inject();
		injectSpeedInsights();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
