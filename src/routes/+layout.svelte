<script lang="ts">
	// @ts-expect-error - No types provided by Vercel for Svelte yet
	import { Analytics } from '@vercel/analytics/svelte';
	// @ts-expect-error - No types provided by Vercel for Svelte yet
	import { SpeedInsights } from '@vercel/speed-insights/svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<Analytics />
<SpeedInsights />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
