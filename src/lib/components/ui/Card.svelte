<script lang="ts">
import type { Snippet } from "svelte"

interface Props {
	children: Snippet
	title?: string
	description?: string
	footer?: Snippet
	headerAction?: Snippet
	class?: string
	contentClass?: string
}

let {
	children,
	title,
	description,
	footer,
	headerAction,
	class: className,
	contentClass,
}: Props = $props()
</script>

<div
	class={cn(
		"flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm",
		className
	)}
>
	{#if title || description || headerAction}
		<div class="flex items-start justify-between gap-4 p-6 pb-4">
			<div class="space-y-1">
				{#if title}
					<h3 class="text-lg leading-none font-semibold tracking-tight text-gray-900">{title}</h3>
				{/if}
				{#if description}
					<p class="text-sm text-gray-500">{description}</p>
				{/if}
			</div>
			{#if headerAction}
				{@render headerAction()}
			{/if}
		</div>
	{/if}

	<div class={cn("flex-1 p-6 pt-0", contentClass)}>
		{@render children()}
	</div>

	{#if footer}
		<div class="mt-auto border-t border-gray-50 bg-gray-50/30 p-6 px-6 py-4 pt-0">
			{@render footer()}
		</div>
	{/if}
</div>
