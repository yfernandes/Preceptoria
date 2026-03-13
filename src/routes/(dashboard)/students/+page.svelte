<script lang="ts">
import type { ActionData, PageData } from "./$types"

let { data, form }: { data: PageData; form: ActionData } = $props()

let isCreating = $state(false)
let searchQuery = $state("")

function _toggleCreate() {
	isCreating = !isCreating
}

const _filteredStudents = $derived(
	data.students.filter(
		(s) =>
			s.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
	)
)

let _activeTab = $state("students") // 'students' or 'invites'
</script>

<div class="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Gestão de Estudantes</h1>
			<p class="mt-1 text-gray-500">
				Gerencie todos os alunos, suas matrículas e turmas vinculadas.
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
				Convidar Estudante
			{/if}
		</Button>
	</div>

	{#if isCreating}
		<div class="mx-auto w-full max-w-2xl">
			<Card
				title="Convidar Novo Estudante"
				description="O estudante receberá um convite por e-mail para completar seu cadastro."
			>
				<form
					method="POST"
					action="?/invite"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === "success") {
								isCreating = false;
								activeTab = "invites";
							}
						};
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 gap-6">
						<Input
							label="Email Acadêmico"
							type="email"
							name="email"
							placeholder="maria@universidade.edu"
							required
						/>

						<div class="space-y-1.5">
							<label class="text-sm font-medium text-gray-700" for="classId">Turma</label>
							<select
								name="classId"
								id="classId"
								required
								class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-xs transition-all outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Selecione uma turma</option>
								{#each data.classes as classItem}
									<option value={classItem.id}>{classItem.name} ({classItem.course.name})</option>
								{/each}
							</select>
						</div>
					</div>

					{#if form?.message}
						<div
							class={cn(
								"flex items-center gap-2 rounded-lg border p-3 text-sm font-medium",
								form.success
									? "border-emerald-100 bg-emerald-50 text-emerald-600"
									: "border-red-100 bg-red-50 text-red-600"
							)}
						>
							<AlertCircle class="h-4 w-4" />
							{form.message}
						</div>
					{/if}

					{#snippet footer()}
						<div class="flex justify-end gap-3">
							<Button type="button" variant="ghost" onclick={toggleCreate}>Cancelar</Button>
							<Button type="submit" class="px-8">Enviar Convite</Button>
						</div>
					{/snippet}
				</form>
			</Card>
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Tabs -->
			<div class="flex border-b border-gray-100">
				<button
					onclick={() => (activeTab = "students")}
					class={cn(
						"border-b-2 px-6 py-3 text-sm font-bold transition-all",
						activeTab === "students"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-400 hover:text-gray-600"
					)}
				>
					Estudantes Ativos
					<Badge class="ml-2 border-blue-100 bg-blue-50 text-blue-600">
						{data.students.length}
					</Badge>
				</button>
				<button
					onclick={() => (activeTab = "invites")}
					class={cn(
						"border-b-2 px-6 py-3 text-sm font-bold transition-all",
						activeTab === "invites"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-400 hover:text-gray-600"
					)}
				>
					Convites Pendentes
					<Badge class="ml-2 border-amber-100 bg-amber-50 text-amber-600">
						{data.pendingInvitations.length}
					</Badge>
				</button>
			</div>

			{#if activeTab === "students"}
				<div class="space-y-4">
					<!-- Filters & Search -->
					<div class="flex flex-col gap-4 sm:flex-row">
						<div class="relative flex-1">
							<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<input
								bind:value={searchQuery}
								type="text"
								placeholder="Buscar por nome, email ou matrícula..."
								class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm shadow-sm transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
							/>
						</div>
						<Button variant="outline" class="flex items-center gap-2">
							<Filter class="h-4 w-4" />
							Filtros
						</Button>
					</div>

					<!-- Table Card -->
					<Card contentClass="p-0">
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-100">
								<thead>
									<tr class="bg-gray-50/50">
										<th
											class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
											>Estudante</th
										>
										<th
											class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
											>Contato & Identificação</th
										>
										<th
											class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
											>Turma & Curso</th
										>
										<th
											class="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase"
											>Ações</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-50 bg-white">
									{#each filteredStudents as student}
										<tr class="group transition-colors hover:bg-gray-50/80">
											<td class="px-6 py-4 whitespace-nowrap">
												<div class="flex items-center gap-3">
													<div
														class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600"
													>
														{student.user.name?.charAt(0)}
													</div>
													<div>
														<div class="text-sm font-bold text-gray-900">{student.user.name}</div>
														<div class="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
															<IdCard class="h-3 w-3" />
															{student.registrationNumber || "Sem matrícula"}
														</div>
													</div>
												</div>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<div class="flex items-center gap-1.5 text-sm text-gray-600">
													<Mail class="h-4 w-4 text-gray-400" />
													{student.user.email}
												</div>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<Badge
													variant="info"
													class="border-blue-100 bg-blue-50 px-3 py-1 font-medium text-blue-700"
												>
													{student.class.name}
												</Badge>
												<p
													class="mt-1 ml-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase"
												>
													{student.class.course.name}
												</p>
											</td>
											<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
												<div
													class="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100"
												>
													<Button
														variant="ghost"
														size="icon"
														class="h-8 w-8 text-gray-400 hover:text-blue-600"
													>
														<Edit2 class="h-4 w-4" />
													</Button>
													<form method="POST" action="?/delete" use:enhance>
														<input type="hidden" name="id" value={student.id} />
														<Button
															type="submit"
															variant="ghost"
															size="icon"
															class="h-8 w-8 text-gray-400 hover:text-red-600"
														>
															<Trash2 class="h-4 w-4" />
														</Button>
													</form>
												</div>
											</td>
										</tr>
									{/each}

									{#if filteredStudents.length === 0}
										<tr>
											<td colspan="4" class="px-6 py-16 text-center">
												<div class="flex flex-col items-center gap-3">
													<div class="rounded-full bg-gray-50 p-4">
														<Search class="h-8 w-8 text-gray-300" />
													</div>
													<p class="font-medium text-gray-500 italic">
														{searchQuery
															? "Nenhum estudante encontrado para sua busca."
															: "Nenhum estudante cadastrado no sistema."}
													</p>
												</div>
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</Card>
				</div>
			{:else}
				<div class="space-y-4">
					<Card contentClass="p-0">
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-100">
								<thead>
									<tr class="bg-gray-50/50">
										<th
											class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
											>E-mail Convidado</th
										>
										<th
											class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
											>Turma Destino</th
										>
										<th
											class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
											>Expira em</th
										>
										<th
											class="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase"
											>Link de Convite</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-50 bg-white">
									{#each data.pendingInvitations as invite}
										<tr class="group transition-colors hover:bg-gray-50/80">
											<td class="px-6 py-4 whitespace-nowrap">
												<div class="flex items-center gap-3">
													<div
														class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-600"
													>
														<Mail class="h-4 w-4" />
													</div>
													<div class="text-sm font-bold text-gray-900">{invite.email}</div>
												</div>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<Badge
													variant="info"
													class="border-blue-100 bg-blue-50 px-3 py-1 font-medium text-blue-700"
												>
													{invite.class?.name || "Sem turma"}
												</Badge>
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												<div class="text-sm text-gray-500">
													{new Date(invite.expiresAt).toLocaleDateString()}
												</div>
											</td>
											<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
												<Button
													variant="outline"
													size="sm"
													onclick={() => {
														const url = `${window.location.origin}/register/${invite.token}`;
														navigator.clipboard.writeText(url);
														alert("Link copiado!");
													}}
												>
													Copiar Link
												</Button>
											</td>
										</tr>
									{/each}

									{#if data.pendingInvitations.length === 0}
										<tr>
											<td colspan="4" class="px-6 py-16 text-center">
												<div class="flex flex-col items-center gap-3">
													<div class="rounded-full bg-gray-50 p-4">
														<Mail class="h-8 w-8 text-gray-300" />
													</div>
													<p class="font-medium text-gray-500 italic">Nenhum convite pendente.</p>
													<Button variant="outline" size="sm" onclick={toggleCreate} class="mt-2">
														Enviar Primeiro Convite
													</Button>
												</div>
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</Card>
				</div>
			{/if}
		</div>
	{/if}
</div>
