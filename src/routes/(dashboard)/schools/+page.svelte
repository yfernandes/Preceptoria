<script lang="ts">
import type { ActionData, PageData } from "./$types"

let { data, form }: { data: PageData; form: ActionData } = $props()

let _isEditing = $state(false)
let searchQuery = $state("")
let _currentSchool = $state({ id: "", name: "", organizationId: "" })

function _editSchool(school: { id: string; name: string; organizationId: string | null }) {
	_currentSchool = {
		id: school.id,
		name: school.name,
		organizationId: school.organizationId || "",
	}
	_isEditing = true
}

function _resetForm() {
	_currentSchool = { id: "", name: "", organizationId: "" }
	_isEditing = false
}

const _filteredSchools = $derived(
	data.schools.filter((s) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
)
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div>
		<h1 class="text-gradient text-3xl font-bold tracking-tight text-gray-900">Gestão de Escolas</h1>
		<p class="mt-1 font-medium text-gray-500">
			Cadastre e organize as instituições de ensino parceiras.
		</p>
	</div>

	<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
		<!-- List Section -->
		<div class="space-y-4 lg:col-span-7">
			<div class="group relative">
				<Search
					class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500"
				/>
				<input
					bind:value={searchQuery}
					type="text"
					placeholder="Buscar instituições por nome..."
					class="w-full rounded-2xl border border-gray-100 bg-white py-3.5 pr-4 pl-12 text-sm shadow-sm transition-all outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-50"
				/>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each filteredSchools as school}
					<div
						class="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"
					>
						<div class="flex flex-col gap-4">
							<div class="flex items-start justify-between">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner transition-transform group-hover:scale-110"
								>
									<School class="h-6 w-6" />
								</div>
								<div
									class="flex translate-x-2 gap-1 opacity-0 transition-opacity group-hover:translate-x-0 group-hover:opacity-100"
								>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600"
										onclick={() => editSchool(school)}
									>
										<Edit2 class="h-3.5 w-3.5" />
									</Button>
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={school.id} />
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											class="h-8 w-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
										>
											<Trash2 class="h-3.5 w-3.5" />
										</Button>
									</form>
								</div>
							</div>

							<div>
								<h3
									class="text-lg leading-snug font-bold text-gray-900 transition-colors group-hover:text-blue-600"
								>
									{school.name}
								</h3>
								<div
									class="mt-3 flex items-center gap-2 rounded-xl border border-gray-100/50 bg-gray-50 p-2"
								>
									<Building2 class="h-3.5 w-3.5 text-gray-400" />
									<span class="truncate text-xs font-bold tracking-tighter text-gray-500 uppercase">
										{data.organizations.find((o) => o.id === school.organizationId)?.name ||
											"Sem Organização"}
									</span>
								</div>
							</div>
						</div>
					</div>
				{/each}

				{#if filteredSchools.length === 0}
					<div
						class="rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/50 py-20 text-center sm:col-span-2"
					>
						<div
							class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm"
						>
							<GraduationCap class="h-10 w-10 text-gray-200" />
						</div>
						<h3 class="text-lg font-bold text-gray-900">Nenhuma instituição encontrada</h3>
						<p class="mx-auto mt-2 max-w-xs text-sm text-gray-500">
							Refine sua busca ou cadastre uma nova escola para começar.
						</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Sticky Form -->
		<div class="sticky top-28 lg:col-span-5">
			<Card
				class="overflow-visible border-none bg-gradient-to-b from-white to-gray-50/50 p-2 shadow-2xl shadow-blue-900/5"
			>
				<div class="p-6">
					<div class="mb-8 flex items-center gap-4">
						<div
							class={isEditing
								? "rotate-3 rounded-2xl bg-amber-100 p-3 text-amber-600"
								: "-rotate-3 rounded-2xl bg-blue-100 p-3 text-blue-600"}
						>
							<Plus class="h-6 w-6" />
						</div>
						<div>
							<h2 class="text-2xl font-bold tracking-tight text-gray-900">
								{isEditing ? "Editar" : "Nova"} Escola
							</h2>
							<Badge
								variant="neutral"
								class="mt-1 border-none bg-gray-100 text-[9px] font-bold tracking-widest text-gray-500 uppercase"
								>Instituição de Ensino</Badge
							>
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
							<input type="hidden" name="id" value={currentSchool.id} />
						{/if}

						<Input
							label="Nome da Instituição"
							name="name"
							placeholder="Ex: Universidade Federal do Rio"
							bind:value={currentSchool.name}
							required
							class="h-12 rounded-xl text-base"
						/>

						<div class="space-y-2">
							<label class="ml-1 text-sm font-bold text-gray-700" for="organizationId">
								Organização Mantenedora
							</label>
							<select
								name="organizationId"
								id="organizationId"
								bind:value={currentSchool.organizationId}
								class="flex h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
							>
								<option value="">Selecione uma organização</option>
								{#each data.organizations as org}
									<option value={org.id}>{org.name}</option>
								{/each}
							</select>
						</div>

						{#if form?.message}
							<div
								class="animate-shake flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-700"
							>
								<X class="h-5 w-5" />
								{form.message}
							</div>
						{/if}

						<div class="flex flex-col gap-3 pt-4 sm:flex-row">
							{#if isEditing}
								<Button
									type="button"
									variant="outline"
									class="h-12 flex-1 rounded-xl border-gray-200 font-bold"
									onclick={resetForm}
								>
									Cancelar
								</Button>
							{/if}
							<Button
								type="submit"
								class="group h-12 flex-1 rounded-xl font-bold shadow-xl shadow-blue-500/20"
							>
								{isEditing ? "Salvar Alterações" : "Cadastrar Escola"}
								<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	</div>
</div>

<style>
	.text-gradient {
		background: linear-gradient(to bottom right, #1e3a8a, #3b82f6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}

	.animate-shake {
		animation: shake 0.2s ease-in-out 0s 2;
	}
</style>
