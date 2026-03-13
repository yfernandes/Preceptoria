<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		class?: string;
	}

	let {
		label,
		error,
		class: className,
		id = Math.random().toString(36).substring(2, 9),
		value = $bindable(),
		...props
	}: Props = $props();
</script>

<div class="w-full space-y-1.5">
	{#if label}
		<label for={id} class="text-sm leading-none font-medium text-gray-700">
			{label}
		</label>
	{/if}
	<input
		{id}
		bind:value
		class={cn(
			"flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-xs transition-all placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
			error && "border-red-500 focus-visible:ring-red-500",
			className
		)}
		{...props}
	/>
	{#if error}
		<p class="text-xs font-medium text-red-500">{error}</p>
	{/if}
</div>
