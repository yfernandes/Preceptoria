<script lang="ts" module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Card from "./Card.svelte";

	const { Story } = defineMeta({
		title: "UI/Card",
		component: Card,
		argTypes: {
			title: { control: "text" },
			description: { control: "text" },
		},
	});
</script>

{#snippet cardContent()}
	<div
		class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-gray-500"
	>
		Conteúdo do Card
	</div>
{/snippet}

{#snippet footerContent()}
	<div class="flex justify-end">
		<button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
			>Salvar Alterações</button
		>
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		title: "Título do Card",
		description: "Uma breve descrição do conteúdo.",
		children: cardContent,
	}}
/>

<Story
	name="With Footer"
	args={{
		title: "Configurações",
		description: "Gerencie suas preferências de conta.",
		children: cardContent,
		footer: footerContent,
	}}
/>
