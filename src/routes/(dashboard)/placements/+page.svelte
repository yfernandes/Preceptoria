<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		Link,
		Hospital,
		User,
		Calendar,
		Plus,
		ArrowLeft,
		AlertCircle,
		Search,
		X
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreating = $state(false);
	let searchQuery = $state('');

	function toggleCreate() {
		isCreating = !isCreating;
	}

	const filteredPlacements = $derived(
		data.placements.filter(
			(p) =>
				p.student.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Vínculos Hospitalares</h1>
			<p class="mt-1 text-gray-500">
				Aloque estudantes em hospitais para seus respectivos estágios.
			</p>
		</div>
		<Button
			onclick={toggleCreate}
			variant={isCreating ? 'outline' : 'primary'}
			class="shadow-lg shadow-blue-100"
		>
			{#if isCreating}
				<ArrowLeft class="mr-2 h-4 w-4" />
				Voltar
			{:else}
				<Link class="mr-2 h-4 w-4" />
				Novo Vínculo
			{/if}
		</Button>
	</div>

	{#if isCreating}
		<div class="mx-auto w-full max-w-2xl">
			<Card title="Criar Vínculo de Estágio">
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') isCreating = false;
						};
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 gap-6">
						<div class="space-y-1.5">
							<label class="text-sm font-medium text-gray-700" for="studentId">Estudante</label>
							<select name="studentId" id="studentId" required class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
								<option value="">Selecione um estudante</option>
								{#each data.students as s}
									<option value={s.id}>{s.user.name} ({s.class.name})</option>
								{/each}
							</select>
						</div>

						<div class="space-y-1.5">
							<label class="text-sm font-medium text-gray-700" for="hospitalId">Hospital de Destino</label>
							<select name="hospitalId" id="hospitalId" required class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
								<option value="">Selecione um hospital</option>
								{#each data.hospitals as h}
									<option value={h.id}>{h.name}</option>
								{/each}
							</select>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<Input label="Início do Estágio" name="startDate" type="date" required />
							<Input label="Previsão de Término" name="endDate" type="date" required />
						</div>
					</div>

					{#snippet footer()}
						<div class="flex justify-end gap-3">
							<Button type="button" variant="ghost" onclick={toggleCreate}>Cancelar</Button>
							<Button type="submit">Efetivar Vínculo</Button>
						</div>
					{/snippet}
				</form>
			</Card>
		</div>
	{:else}
		<div class="space-y-4">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input
					bind:value={searchQuery}
					type="text"
					placeholder="Buscar por estudante ou hospital..."
					class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-blue-100"
				/>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredPlacements as p}
					<Card class="flex flex-col gap-4 p-5">
						<div class="flex items-start justify-between">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
								<User class="h-5 w-5" />
							</div>
							<form method="POST" action="?/terminate" use:enhance>
								<input type="hidden" name="id" value={p.id} />
								<Button variant="ghost" size="icon" class="h-8 w-8 text-gray-400 hover:text-red-600">
									<X class="h-4 w-4" />
								</Button>
							</form>
						</div>
						
						<div>
							<h3 class="font-bold text-gray-900">{p.student.user.name}</h3>
							<p class="text-xs text-gray-500 font-medium">{p.student.class.name}</p>
						</div>

						<div class="space-y-2 border-t border-gray-50 pt-3">
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<Hospital class="h-4 w-4 text-gray-400" />
								<span class="font-bold">{p.hospital.name}</span>
							</div>
							<div class="flex items-center gap-2 text-xs text-gray-500">
								<Calendar class="h-4 w-4 text-gray-400" />
								{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
							</div>
						</div>
					</Card>
				{/each}
			</div>
		</div>
	{/if}
</div>
