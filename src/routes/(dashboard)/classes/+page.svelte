<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData, ActionData } from "./$types";
	import Button from "$lib/components/ui/Button.svelte";
	import Input from "$lib/components/ui/Input.svelte";
	import Card from "$lib/components/ui/Card.svelte";
	import Badge from "$lib/components/ui/Badge.svelte";
	import {
		Plus,
		Search,
		Filter,
		Calendar,
		User,
		BookOpen,
		Building,
		ArrowLeft,
		AlertCircle,
		CheckCircle,
	} from "lucide-svelte";
	import { cn } from "$lib/utils";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreating = $state(false);
	let searchQuery = $state("");

	function toggleCreate() {
		isCreating = !isCreating;
	}

	const filteredClasses = $derived(
		data.classes.filter(
			(c) =>
				c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.supervisor?.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<div class="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Gestão de Turmas</h1>
			<p class="mt-1 text-gray-500">
				Gerencie as turmas, datas de início/fim e supervisores responsáveis.
			</p>
		</div>
		<Button
			onclick={toggleCreate}
			variant={isCreating ? "outline" : "primary"}
			class="shadow-lg shadow-blue-100"
		>
			{#if isCreating}
				<ArrowLeft class="mr-2 h-4 w-4" />
				Voltar para Lista
			{:else}
				<Plus class="mr-2 h-4 w-4" />
				Nova Turma
			{/if}
		</Button>
	</div>

	{#if isCreating}
		<div class="mx-auto w-full max-w-2xl">
			<Card
				title="Cadastrar Nova Turma"
				description="Crie uma turma e vincule-a a um curso e supervisor."
			>
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === "success") {
								isCreating = false;
							}
						};
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 gap-6">
						<Input label="Nome da Turma" name="name" placeholder="Ex: Turma A - 2024.1" required />

						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div class="space-y-1.5">
								<label class="text-sm font-medium text-gray-700" for="courseId">Curso</label>
								<select
									name="courseId"
									id="courseId"
									required
									class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-xs transition-all outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Selecione um curso</option>
									{#each data.courses as course}
										<option value={course.id}>{course.name} ({course.school.name})</option>
									{/each}
								</select>
							</div>

							<div class="space-y-1.5">
								<label class="text-sm font-medium text-gray-700" for="supervisorId"
									>Supervisor</label
								>
								<select
									name="supervisorId"
									id="supervisorId"
									disabled={data.user?.role === "Supervisor"}
									class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-xs transition-all outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
								>
									<option value="">Selecione um supervisor</option>
									{#each data.supervisors as sup}
										<option
											value={sup.id}
											selected={data.user?.role === "Supervisor" && sup.userId === data.user?.id}
										>
											{sup.user.name}
										</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Input label="Data de Início" name="startDate" type="date" required />
							<Input label="Data de Término" name="endDate" type="date" required />
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
							<Button type="button" variant="ghost" onclick={toggleCreate}>Cancelar</Button>
							<Button type="submit" class="px-8">Criar Turma</Button>
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
					placeholder="Buscar por turma, curso ou supervisor..."
					class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm shadow-sm transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
				/>
			</div>

			<Card contentClass="p-0">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-100">
						<thead>
							<tr class="bg-gray-50/50">
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
									>Turma</th
								>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
									>Status</th
								>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
									>Curso / Escola</th
								>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
									>Supervisor</th
								>
								<th
									class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
									>Período</th
								>
								<th
									class="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase"
									>Ações</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50 bg-white">
							{#each filteredClasses as classItem}
								<tr class="group transition-colors hover:bg-gray-50/80">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm font-bold text-gray-900">{classItem.name}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if classItem.status === "ACTIVE"}
											<Badge
												variant="info"
												class="border-emerald-100 bg-emerald-50 text-emerald-700">Ativa</Badge
											>
										{:else}
											<Badge variant="neutral" class="border-gray-200 bg-gray-50 text-gray-500"
												>Finalizada</Badge
											>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex flex-col">
											<span class="text-sm text-gray-700">{classItem.course.name}</span>
											<span class="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
												{classItem.course.school.name}
											</span>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center gap-2">
											<div
												class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
											>
												{classItem.supervisor?.user.name?.charAt(0) || "?"}
											</div>
											<span class="text-sm text-gray-600"
												>{classItem.supervisor?.user.name || "Não atribuído"}</span
											>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center gap-2 text-xs text-gray-500">
											<Calendar class="h-3.5 w-3.5" />
											{new Date(classItem.startDate).toLocaleDateString()} - {new Date(
												classItem.endDate
											).toLocaleDateString()}
										</div>
									</td>
									<td class="px-6 py-4 text-right whitespace-nowrap">
										{#if classItem.status === "ACTIVE"}
											<form method="POST" action="?/complete" use:enhance>
												<input type="hidden" name="id" value={classItem.id} />
												<Button
													type="submit"
													variant="outline"
													size="sm"
													class="border-amber-100 text-amber-600 hover:bg-amber-50"
												>
													<CheckCircle class="mr-1.5 h-3.5 w-3.5" />
													Finalizar
												</Button>
											</form>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	{/if}
</div>
