<script lang="ts">
import type { Snippet } from "svelte"

interface Props {
	children: Snippet
	variant?: "success" | "warning" | "error" | "info" | "neutral"
	class?: string
}

let { children, variant = "neutral", class: className }: Props = $props()

const _variants = {
	success: "bg-green-50 text-green-700 border-green-200",
	warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
	error: "bg-red-50 text-red-700 border-red-200",
	info: "bg-blue-50 text-blue-700 border-blue-200",
	neutral: "bg-gray-50 text-gray-700 border-gray-200",
}
</script>

<span
	class={cn(
		"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
		variants[variant],
		className
	)}
>
	{@render children()}
</span>
