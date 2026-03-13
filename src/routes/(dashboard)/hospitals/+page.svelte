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
		Hospital,
		MapPin,
		Building2,
		Trash2,
		Edit2,
		AlertCircle,
		ArrowLeft,
		Mail,
		UserCog,
	} from "lucide-svelte";
	import { cn } from "$lib/utils";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreating = $state(false);
	let isInviting = $state(false);
	let searchQuery = $state("");
	let activeTab = $state("hospitals"); // 'hospitals' or 'invites'

	function toggleCreate() {
		isCreating = !isCreating;
		isInviting = false;
	}

	function toggleInvite() {
		isInviting = !isInviting;
		isCreating = false;
	}

	const filteredHospitals = $derived(
		data.hospitals.filter(
			(h) =>
				h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				h.address?.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Rede Hospitalar</h1>
			<p class="mt-1 text-gray-500">Gerencie os hospitais parceiros e seus respectivos gestores.</p>
		</div>
		<div class="flex gap-3">
			<Button onclick={toggleInvite} variant={isInviting ? "outline" : "secondary"}>
				{#if isInviting}
					<ArrowLeft class="mr-2 h-4 w-4" />
					Voltar
				{:else}
					<UserCog class="mr-2 h-4 w-4" />
					Convidar Gestor
				{/if}
			</Button>
			<Button
				onclick={toggleCreate}
				variant={isCreating ? "outline" : "primary"}
				class="shadow-lg shadow-blue-100"
			>
				{#if isCreating}
					<ArrowLeft class="mr-2 h-4 w-4" />
					Voltar
				{:else}
					<Plus class="mr-2 h-4 w-4" />
					Novo Hospital
				{/if}
			</Button>
		</div>
	</div>

	{#if isCreating}
		<div class="mx-auto w-full max-w-2xl">
			<Card title="Cadastrar Novo Hospital">
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === "success") isCreating = false;
						};
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 gap-6">
						<Input
							label="Nome do Hospital"
							name="name"
							placeholder="Ex: Hospital Central"
							required
						/>
						<Input label="Endereço" name="address" placeholder="Rua, Número, Bairro, Cidade" />
						<div class="space-y-1.5">
							<label class="text-sm font-medium text-gray-700" for="organizationId"
								>Organização</label
							>
							<select
								name="organizationId"
								id="organizationId"
								class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Selecione uma organização</option>
								{#each data.organizations as org}
									<option value={org.id}>{org.name}</option>
								{/each}
							</select>
						</div>
					</div>
					{#snippet footer()}
						<div class="flex justify-end gap-3">
							<Button type="button" variant="ghost" onclick={toggleCreate}>Cancelar</Button>
							<Button type="submit">Salvar Hospital</Button>
						</div>
					{/snippet}
				</form>
			</Card>
		</div>
	{:else if isInviting}
		<div class="mx-auto w-full max-w-2xl">
			<Card
				title="Convidar Gestor Hospitalar"
				description="O gestor terá acesso administrativo aos dados de estudantes no hospital selecionado."
			>
				<form
					method="POST"
					action="?/inviteManager"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === "success") {
								isInviting = false;
								activeTab = "invites";
							}
						};
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 gap-6">
						<Input
							label="E-mail do Gestor"
							name="email"
							type="email"
							placeholder="gestor@hospital.com"
							required
						/>
						<div class="space-y-1.5">
							<label class="text-sm font-medium text-gray-700" for="hospitalId"
								>Hospital Responsável</label
							>
							<select
								name="hospitalId"
								id="hospitalId"
								required
								class="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Selecione um hospital</option>
								{#each data.hospitals as hospital}
									<option value={hospital.id}>{hospital.name}</option>
								{/each}
							</select>
						</div>
					</div>
					{#snippet footer()}
						<div class="flex justify-end gap-3">
							<Button type="button" variant="ghost" onclick={toggleInvite}>Cancelar</Button>
							<Button type="submit">Enviar Convite</Button>
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
					onclick={() => (activeTab = "hospitals")}
					class={cn(
						"border-b-2 px-6 py-3 text-sm font-bold transition-all",
						activeTab === "hospitals"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-400 hover:text-gray-600"
					)}
				>
					Hospitais Ativos
					<Badge variant="neutral" class="ml-2 bg-blue-50 text-blue-600">
						{data.hospitals.length}
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
					Convites de Gestores
					<Badge variant="neutral" class="ml-2 bg-amber-50 text-amber-600">
						{data.pendingInvitations.length}
					</Badge>
				</button>
			</div>

			{#if activeTab === "hospitals"}
				<div class="space-y-4">
					<div class="relative flex-1">
						<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							bind:value={searchQuery}
							type="text"
							placeholder="Buscar por hospital ou endereço..."
							class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-blue-100"
						/>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						{#each filteredHospitals as hospital}
							<Card class="group relative overflow-hidden transition-all hover:shadow-md">
								<div class="flex items-start gap-4">
									<div
										class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
									>
										<Hospital class="h-7 w-7" />
									</div>
									<div class="flex-1 space-y-1">
										<h3 class="text-lg font-bold text-gray-900">{hospital.name}</h3>
										<div class="flex items-center gap-1.5 text-sm text-gray-500">
											<MapPin class="h-4 w-4 text-gray-400" />
											{hospital.address || "Endereço não informado"}
										</div>
									</div>
								</div>
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
										>Gestor Convidado</th
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
											<span class="text-sm font-bold text-gray-700">{invite.hospital?.name}</span>
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
