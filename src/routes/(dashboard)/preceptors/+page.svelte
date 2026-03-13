<script lang="ts">
import type { ActionData, PageData } from "./$types"

let { data, form }: { data: PageData; form: ActionData & { message?: string; success?: boolean } } =
	$props()

let isCreating = $state(false)
let searchQuery = $state("")
let _activeTab = $state("preceptors") // 'preceptors' or 'invites'

function _toggleCreate() {
	isCreating = !isCreating
}

const _filteredPreceptors = $derived(
	data.preceptors.filter(
		(p) =>
			p.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
	)
)
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Corpo Preceptor</h1>
			<p class="mt-1 text-gray-500">
				Gerencie os preceptores responsáveis pelo acompanhamento dos alunos nos hospitais.
			</p>
		</div>
		<Button
			onclick={toggleCreate}
			variant={isCreating ? "outline" : "primary"}
			class="shadow-lg shadow-emerald-100"
		>
			{#if isCreating}
				<ArrowLeft class="mr-2 h-4 w-4" />
				Voltar para Lista
			{:else}
				<Plus class="mr-2 h-4 w-4" />
				Convidar Preceptor
			{/if}
		</Button>
	</div>

	{#if isCreating}
		<div class="mx-auto w-full max-w-2xl">
			<Card
				title="Convidar Novo Preceptor"
				description="O preceptor receberá um convite por e-mail para completar seu cadastro e vínculo hospitalar."
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
							label="E-mail do Preceptor"
							type="email"
							name="email"
							placeholder="preceptor@hospital.com"
							required
						/>

						<div class="space-y-1.5">
							<label class="text-sm font-medium text-gray-700" for="hospitalId"
								>Hospital de Vínculo</label
							>
							<select
								name="hospitalId"
								id="hospitalId"
								required
								class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
							>
								<option value="">Selecione um hospital</option>
								{#each data.hospitals as hospital}
									<option value={hospital.id}>{hospital.name}</option>
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
					onclick={() => (activeTab = "preceptors")}
					class={cn(
						"border-b-2 px-6 py-3 text-sm font-bold transition-all",
						activeTab === "preceptors"
							? "border-emerald-600 text-emerald-600"
							: "border-transparent text-gray-400 hover:text-gray-600"
					)}
				>
					Preceptores Ativos
					<Badge variant="neutral" class="ml-2 bg-emerald-50 text-emerald-600">
						{data.preceptors.length}
					</Badge>
				</button>
				<button
					onclick={() => (activeTab = "invites")}
					class={cn(
						"border-b-2 px-6 py-3 text-sm font-bold transition-all",
						activeTab === "invites"
							? "border-emerald-600 text-emerald-600"
							: "border-transparent text-gray-400 hover:text-gray-600"
					)}
				>
					Convites Pendentes
					<Badge variant="neutral" class="ml-2 bg-amber-50 text-amber-600">
						{data.pendingInvitations.length}
					</Badge>
				</button>
			</div>

			{#if activeTab === "preceptors"}
				<div class="space-y-4">
					<div class="relative flex-1">
						<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							bind:value={searchQuery}
							type="text"
							placeholder="Buscar por nome, especialidade ou hospital..."
							class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-emerald-100"
						/>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each filteredPreceptors as preceptor}
							<Card class="group relative overflow-hidden transition-all hover:shadow-lg">
								<div class="flex items-start gap-4">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
									>
										<Stethoscope class="h-6 w-6" />
									</div>
									<div class="flex-1 space-y-1">
										<h3 class="font-bold text-gray-900">{preceptor.user.name}</h3>
										<p class="text-xs font-medium text-gray-500">
											{preceptor.specialty || "Especialidade não informada"}
										</p>
										<div
											class="flex items-center gap-1 text-[10px] font-bold tracking-tight text-gray-400 uppercase"
										>
											<Hospital class="h-3 w-3" />
											{preceptor.hospital.name}
										</div>
									</div>
								</div>

								{#snippet footer()}
									<div class="flex items-center justify-between">
										<span class="text-[10px] font-bold text-gray-400 uppercase"
											>CRM: {preceptor.licenseNumber || "---"}</span
										>
										<Button
											variant="ghost"
											size="sm"
											class="h-8 text-xs text-gray-400 hover:text-emerald-600"
										>
											Ver Detalhes <ChevronRight class="ml-1 h-3 w-3" />
										</Button>
									</div>
								{/snippet}
							</Card>
						{/each}
					</div>
				</div>
			{:else}
				<Card contentClass="p-0">
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-100">
							<thead>
								<tr class="bg-gray-50/50">
									<th
										class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
										>Preceptor Convidado</th
									>
									<th
										class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
										>Hospital</th
									>
									<th
										class="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase"
										>Expira em</th
									>
									<th
										class="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase"
										>Link</th
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
											<Badge variant="info" class="border-blue-100 bg-blue-50 text-blue-700">
												{invite.hospital?.name || "---"}
											</Badge>
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
											{new Date(invite.expiresAt).toLocaleDateString()}
										</td>
										<td class="px-6 py-4 text-right whitespace-nowrap">
											<Button
												variant="outline"
												size="sm"
												onclick={() => {
													const url = `${window.location.origin}/register/${invite.token}`;
													navigator.clipboard.writeText(url);
													alert("Link copiado!");
												}}
											>
												Copiar
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card>
			{/if}
		</div>
	{/if}
</div>
