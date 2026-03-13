<script lang="ts">
import { inject } from "@vercel/analytics"
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit"
import { onMount } from "svelte"
import "./layout.css"

let { children } = $props()

onMount(() => {
	inject()
	injectSpeedInsights()
})
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
