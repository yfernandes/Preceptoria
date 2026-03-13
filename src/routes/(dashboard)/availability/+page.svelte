<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData, ActionData } from "./$types";
	import Button from "$lib/components/ui/Button.svelte";
	import Input from "$lib/components/ui/Input.svelte";
	import Card from "$lib/components/ui/Card.svelte";
	import Badge from "$lib/components/ui/Badge.svelte";
	import { Calendar, Clock, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-svelte";
	import { cn } from "$lib/utils";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isAdding = $state(false);
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Sua Disponibilidade</h1>
			<p class="mt-1 text-gray-500">
				Informe os dias e horários que você estará disponível para os plantões.
			</p>
		</div>
		<Button
			onclick={() => (isAdding = !isAdding)}
			variant={isAdding ? "outline" : "primary"}
			class="shadow-lg shadow-blue-100"
		>
			{#if isAdding}
				Cancelar
			{:else}
				<Plus class="mr-2 h-4 w-4" />
				Adicionar Horário
			{/if}
		</Button>
	</div>

	{#if isAdding}
		<div class="mx-auto w-full max-w-xl">
			<Card title="Novo Horário de Disponibilidade">
				<form
					method="POST"
					action="?/submit"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === "success") {
								isAdding = false;
							}
						};
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 gap-6">
						<Input label="Data" name="date" type="date" required />
						<div class="grid grid-cols-2 gap-4">
							<Input label="Hora Início" name="startTime" type="time" required />
							<Input label="Hora Fim" name="endTime" type="time" required />
						</div>
					</div>

					{#if form?.message}
						<div
							class="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600"
						>
							<AlertCircle class="h-4 w-4" />
							{form.message}
						</div>
					{/if}

					{#snippet footer()}
						<div class="flex justify-end gap-3">
							<Button type="button" variant="ghost" onclick={() => (isAdding = false)}
								>Voltar</Button
							>
							<Button type="submit">Salvar Disponibilidade</Button>
						</div>
					{/snippet}
				</form>
			</Card>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.availabilities as avail}
			<Card class="relative overflow-hidden transition-all hover:shadow-md">
				<div class="flex items-start justify-between">
					<div class="space-y-3">
						<div class="flex items-center gap-2 text-blue-600">
							<Calendar class="h-5 w-5" />
							<span class="text-sm font-bold tracking-tight uppercase">
								{new Date(avail.date).toLocaleDateString("pt-BR", {
									weekday: "long",
									day: "2-digit",
									month: "long",
								})}
							</span>
						</div>
						<div class="flex items-center gap-4 text-gray-600">
							<div class="flex items-center gap-1.5">
								<Clock class="h-4 w-4 text-gray-400" />
								<span class="text-sm font-medium">
									{new Date(avail.startTime).toLocaleTimeString("pt-BR", {
										hour: "2-digit",
										minute: "2-digit",
									})}
									-
									{new Date(avail.endTime).toLocaleTimeString("pt-BR", {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						</div>
					</div>

					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={avail.id} />
						<Button
							variant="ghost"
							size="icon"
							type="submit"
							class="text-gray-400 hover:text-red-600"
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</form>
				</div>
			</Card>
		{/each}

		{#if data.availabilities.length === 0}
			<div
				class="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/50 py-20 text-center"
			>
				<div class="mb-4 rounded-full bg-white p-4 shadow-sm">
					<Calendar class="h-8 w-8 text-gray-200" />
				</div>
				<p class="text-gray-500 italic">Nenhuma disponibilidade cadastrada.</p>
				<Button variant="outline" size="sm" class="mt-4" onclick={() => (isAdding = true)}>
					Adicionar Meu Primeiro Horário
				</Button>
			</div>
		{/if}
	</div>
</div>
