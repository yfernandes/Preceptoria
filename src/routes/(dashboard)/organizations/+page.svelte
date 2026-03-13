<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData, ActionData } from "./$types";
	import Button from "$lib/components/ui/Button.svelte";
	import Input from "$lib/components/ui/Input.svelte";
	import Card from "$lib/components/ui/Card.svelte";
	import Badge from "$lib/components/ui/Badge.svelte";
	import {
		Building2,
		Trash2,
		Edit2,
		Search,
		Plus,
		X,
		ArrowRight,
		ShieldCheck,
		Globe,
		MoreHorizontal,
		CheckCircle2,
	} from "lucide-svelte";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isEditing = $state(false);
	let searchQuery = $state("");
	let currentOrg = $state({ id: "", name: "" });

	function editOrg(org: any) {
		currentOrg = { id: org.id, name: org.name };
		isEditing = true;
	}

	function resetForm() {
		currentOrg = { id: "", name: "" };
		isEditing = false;
	}

	const filteredOrgs = $derived(
		data.organizations.filter((o) => o.name?.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Gestão de Organizações</h1>
			<p class="mt-1 font-medium text-gray-500">
				Controle as organizações guarda-chuva do sistema.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<Badge
				variant="info"
				class="rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-bold tracking-widest text-blue-700 uppercase"
			>
				{data.organizations.length} Cadastradas
			</Badge>
		</div>
	</div>

	<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
		<!-- List Section -->
		<div class="space-y-6 lg:col-span-7">
			<div class="group relative">
				<Search
					class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500"
				/>
				<input
					bind:value={searchQuery}
					type="text"
					placeholder="Filtrar por nome da organização..."
					class="w-full rounded-2xl border border-gray-100 bg-white py-4 pr-4 pl-12 text-sm shadow-sm transition-all outline-none focus:ring-4 focus:ring-blue-50"
				/>
			</div>

			<div class="grid grid-cols-1 gap-4">
				{#each filteredOrgs as org}
					<div
						class="group rounded-3xl border border-gray-100 bg-white p-1.5 pr-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4">
								<div
									class="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-gray-100 bg-gradient-to-tr from-gray-50 to-white text-gray-400 shadow-inner transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-500 group-hover:text-white"
								>
									<Building2 class="h-7 w-7" />
								</div>
								<div>
									<h3 class="font-bold text-gray-900 transition-colors group-hover:text-blue-600">
										{org.name}
									</h3>
									<div
										class="mt-1 flex items-center gap-1.5 text-xs font-bold tracking-widest text-gray-400 uppercase"
									>
										<ShieldCheck class="h-3 w-3 text-emerald-500" />
										Ativo no Sistema
									</div>
								</div>
							</div>

							<div class="flex gap-2">
								<Button
									variant="ghost"
									size="icon"
									class="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600"
									onclick={() => editOrg(org)}
								>
									<Edit2 class="h-4 w-4" />
								</Button>
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={org.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										class="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</div>
						</div>
					</div>
				{/each}

				{#if filteredOrgs.length === 0}
					<div
						class="rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/50 py-24 text-center"
					>
						<div
							class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm"
						>
							<Globe class="h-10 w-10 animate-pulse text-gray-200" />
						</div>
						<h3 class="text-lg font-bold text-gray-900">Nenhuma organização encontrada</h3>
						<p class="mx-auto mt-2 max-w-xs text-sm text-gray-500">
							Expanda seus horizontes cadastrando uma nova organização gestora.
						</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Compact Form Section -->
		<div class="sticky top-28 lg:col-span-5">
			<Card class="border-none bg-gray-900 p-4 text-white shadow-2xl shadow-blue-900/5">
				<div class="mb-8 flex items-center gap-4">
					<div class="rounded-2xl bg-white/10 p-3">
						<Plus class="h-6 w-6 text-blue-400" />
					</div>
					<div>
						<h2 class="text-xl font-bold tracking-tight">
							{isEditing ? "Atualizar" : "Registrar"} Organização
						</h2>
						<p class="mt-1 text-xs font-medium tracking-widest text-gray-400 uppercase">
							Configurações de Entidade
						</p>
					</div>
				</div>

				<form
					method="POST"
					action={isEditing ? "?/update" : "?/create"}
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === "success") {
								resetForm();
							}
						};
					}}
					class="space-y-6"
				>
					{#if isEditing}
						<input type="hidden" name="id" value={currentOrg.id} />
					{/if}

					<div class="space-y-2">
						<label class="ml-1 text-sm font-bold text-gray-300" for="name"
							>Nome da Organização</label
						>
						<input
							id="name"
							name="name"
							type="text"
							placeholder="Ex: Grupo Hospitalar do Sul"
							bind:value={currentOrg.name}
							required
							class="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-base text-white shadow-sm transition-all outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
						/>
					</div>

					{#if form?.message}
						<div
							class="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-400"
						>
							<X class="h-5 w-5" />
							{form.message}
						</div>
					{/if}

					<div class="flex gap-3 pt-4">
						{#if isEditing}
							<button
								type="button"
								class="h-12 flex-1 rounded-xl bg-white/5 font-bold text-gray-300 transition-colors hover:bg-white/10"
								onclick={resetForm}
							>
								Cancelar
							</button>
						{/if}
						<button
							type="submit"
							class="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500"
						>
							{isEditing ? "Salvar Mudanças" : "Confirmar Registro"}
							<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</button>
					</div>
				</form>

				{#snippet footer()}
					<div
						class="flex items-center gap-2 text-[10px] font-bold tracking-tighter text-gray-500 uppercase"
					>
						<ShieldCheck class="h-3.5 w-3.5" />
						Protegido por políticas de segurança RBAC
					</div>
				{/snippet}
			</Card>
		</div>
	</div>
</div>
