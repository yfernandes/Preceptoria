<script lang="ts" module>
import { defineMeta } from "@storybook/addon-svelte-csf"
import Badge from "./Badge.svelte"

const { Story } = defineMeta({
	title: "UI/Badge",
	component: Badge,
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["success", "warning", "error", "info", "neutral"],
		},
	},
})
</script>

<Story name="Default" args={{ variant: "neutral", children: () => "Pendente" }} />

<Story name="Success" args={{ variant: "success", children: () => "Aprovado" }} />

<Story name="Warning" args={{ variant: "warning", children: () => "Expira em breve" }} />

<Story name="Error" args={{ variant: "error", children: () => "Expirado / Rejeitado" }} />

<Story name="Info" args={{ variant: "info", children: () => "Em Análise" }} />
