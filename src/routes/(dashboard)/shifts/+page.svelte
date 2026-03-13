<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		Calendar,
		Clock,
		Plus,
		Users,
		User,
		Hospital,
		MapPin,
		Trash2,
		AlertCircle,
		CheckCircle2,
		X
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreating = $state(false);
	let selectedShiftId = $state<string | null>(null);

	function toggleCreate() {
		isCreating = !isCreating;
	}
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Gestão de Plantões</h1>
			<p class="mt-1 text-gray-500">
				Crie plantões e atribua estudantes com base em suas disponibilidades e documentos.
			</p>
		</div>
		<Button
			onclick={toggleCreate}
			variant={isCreating ? 'outline' : 'primary'}
			class="shadow-lg shadow-blue-100"
		>
			{#if isCreating}
				Cancelar
			{:else}
				<Plus class="mr-2 h-4 w-4" />
				Novo Plantão
			{/if}
		</Button>
	</div>

	{#if isCreating}
		<div class="mx-auto w-full max-w-2xl">
			<Card title="Criar Novo Plantão">
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								isCreating = false;
							}
						};
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 gap-6">
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div class="space-y-1.5">
								<label class="text-sm font-medium text-gray-700" for="hospitalId">Hospital</label>
								<select name="hospitalId" id="hospitalId" required class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
									<option value="">Selecione um hospital</option>
									{#each data.hospitals as h}
										<option value={h.id}>{h.name}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-1.5">
								<label class="text-sm font-medium text-gray-700" for="preceptorId">Preceptor Responsável</label>
								<select name="preceptorId" id="preceptorId" required class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
									<option value="">Selecione um preceptor</option>
									{#each data.preceptors as p}
										<option value={p.id}>{p.user.name}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
							<Input label="Data" name="date" type="date" required />
							<Input label="Hora Início" name="startTime" type="time" required />
							<Input label="Hora Fim" name="endTime" type="time" required />
						</div>

						<Input label="Local Específico (Setor/Ala)" name="location" placeholder="Ex: UTI Adulto, Bloco B" />
					</div>

					{#if form?.message}
						<div class="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
							<AlertCircle class="h-4 w-4" />
							{form.message}
						</div>
					{/if}

					{#snippet footer()}
						<div class="flex justify-end gap-3">
							<Button type="button" variant="ghost" onclick={toggleCreate}>Voltar</Button>
							<Button type="submit">Criar Plantão</Button>
						</div>
					{/snippet}
				</form>
			</Card>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		{#each data.shifts as shift}
			<Card class="flex flex-col gap-6 p-6">
				<div class="flex items-start justify-between">
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
								<Hospital class="h-6 w-6" />
							</div>
							<div>
								<h3 class="text-lg font-bold text-gray-900">{shift.hospital.name}</h3>
								<div class="flex items-center gap-1.5 text-xs text-gray-500">
									<MapPin class="h-3 w-3" />
									{shift.location || 'Local não especificado'}
								</div>
							</div>
						</div>

						<div class="flex flex-wrap gap-4 text-sm text-gray-600">
							<div class="flex items-center gap-1.5 font-medium">
								<Calendar class="h-4 w-4 text-blue-500" />
								{new Date(shift.date).toLocaleDateString()}
							</div>
							<div class="flex items-center gap-1.5 font-medium">
								<Clock class="h-4 w-4 text-blue-500" />
								{new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
								{new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</div>
							<div class="flex items-center gap-1.5 font-medium">
								<User class="h-4 w-4 text-blue-500" />
								{shift.preceptor.user.name}
							</div>
						</div>
					</div>
				</div>

				<div class="space-y-3">
					<div class="flex items-center justify-between border-t border-gray-50 pt-4">
						<h4 class="text-xs font-bold uppercase tracking-widest text-gray-400">Estudantes Escalados</h4>
						<Badge variant="neutral" class="bg-gray-100 text-gray-600 border-none">
							{shift.students.length}
						</Badge>
					</div>

					<div class="flex flex-wrap gap-2">
						{#each shift.students as entry}
							<div class="flex items-center gap-2 rounded-full bg-gray-50 py-1 pl-1 pr-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100">
								<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
									{entry.student.user.name?.charAt(0)}
								</div>
								<span>{entry.student.user.name}</span>
								<form method="POST" action="?/removeStudent" use:enhance>
									<input type="hidden" name="shiftId" value={shift.id} />
									<input type="hidden" name="studentId" value={entry.studentId} />
									<button type="submit" class="ml-1 text-gray-400 hover:text-red-500">
										<X class="h-3 w-3" />
									</button>
								</form>
							</div>
						{/each}
						
						<Button variant="ghost" size="sm" class="h-8 rounded-full border-dashed border-gray-200 text-[10px]" onclick={() => (selectedShiftId = shift.id)}>
							<Plus class="mr-1 h-3 w-3" /> Adicionar Estudante
						</Button>
					</div>
				</div>

				{#if selectedShiftId === shift.id}
					<div class="animate-in slide-in-from-top-2 mt-4 rounded-2xl bg-blue-50/50 p-4 ring-1 ring-blue-100">
						<div class="mb-3 flex items-center justify-between">
							<span class="text-xs font-bold text-blue-700 uppercase">Atribuir Estudante</span>
							<button onclick={() => (selectedShiftId = null)}><X class="h-4 w-4 text-blue-400" /></button>
						</div>
						<form method="POST" action="?/assign" use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') selectedShiftId = null;
							};
						}} class="flex gap-2">
							<input type="hidden" name="shiftId" value={shift.id} />
							<select name="studentId" required class="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm outline-none">
								<option value="">Selecione um estudante...</option>
								{#each data.students as s}
									{@const allDocsApproved = s.documents.length > 0 && s.documents.every(d => d.status === 'APPROVED')}
									<option value={s.id} disabled={!allDocsApproved}>
										{s.user.name} {!allDocsApproved ? '(Docs Pendentes)' : ''}
									</option>
								{/each}
							</select>
							<Button type="submit" size="sm">Atribuir</Button>
						</form>
					</div>
				{/if}
			</Card>
		{/each}
	</div>
</div>
