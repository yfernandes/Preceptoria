<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { type Snippet } from "svelte";
	import { cn } from "$lib/utils";

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
		size?: "sm" | "md" | "lg" | "icon";
		class?: string;
	}

	let { children, variant = "primary", size = "md", class: className, ...props }: Props = $props();

	const variants = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-blue-700",
		secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
		outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-xs",
		ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
		danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-700",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-xs h-8",
		md: "px-4 py-2 text-sm h-10",
		lg: "px-6 py-3 text-base h-12",
		icon: "p-2 h-10 w-10",
	};

	const baseClass =
		"inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";
</script>

<button class={cn(baseClass, variants[variant], sizes[size], className)} {...props}>
	{@render children()}
</button>
