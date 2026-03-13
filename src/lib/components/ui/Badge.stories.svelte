<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		title: 'UI/Badge',
		component: Badge,
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['success', 'warning', 'error', 'info', 'neutral']
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'neutral' }}>
	{#snippet children()}
		Pendente
	{/snippet}
</Story>

<Story name="Success" args={{ variant: 'success' }}>
	{#snippet children()}
		Aprovado
	{/snippet}
</Story>

<Story name="Warning" args={{ variant: 'warning' }}>
	{#snippet children()}
		Expira em breve
	{/snippet}
</Story>

<Story name="Error" args={{ variant: 'error' }}>
	{#snippet children()}
		Expirado / Rejeitado
	{/snippet}
</Story>

<Story name="Info" args={{ variant: 'info' }}>
	{#snippet children()}
		Em Análise
	{/snippet}
</Story>
