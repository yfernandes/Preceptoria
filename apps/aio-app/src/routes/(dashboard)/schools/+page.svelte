<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isEditing = $state(false);
	let currentSchool = $state({ id: '', name: '' });

	function editSchool(school: any) {
		currentSchool = { ...school };
		isEditing = true;
	}

	function resetForm() {
		currentSchool = { id: '', name: '' };
		isEditing = false;
	}
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-6">Gestão de Escolas</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
		<!-- List -->
		<div class="bg-white p-4 rounded shadow">
			<h2 class="text-xl font-semibold mb-4">Escolas Cadastradas</h2>
			{#if data.schools.length === 0}
				<p class="text-gray-500 text-sm">Nenhuma escola encontrada.</p>
			{:else}
				<ul class="divide-y">
					{#each data.schools as school}
						<li class="py-3 flex justify-between items-center">
							<div>
								<p class="font-medium">{school.name}</p>
							</div>
							<div class="flex gap-2">
								<button
									onclick={() => editSchool(school)}
									class="text-blue-600 hover:underline text-sm"
								>
									Editar
								</button>
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={school.id} />
									<button type="submit" class="text-red-600 hover:underline text-sm">
										Excluir
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Form -->
		<div class="bg-white p-4 rounded shadow h-fit">
			<h2 class="text-xl font-semibold mb-4">{isEditing ? 'Editar' : 'Nova'} Escola</h2>
			<form method="POST" action={isEditing ? '?/update' : '?/create'} use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						resetForm();
					}
				};
			}}>
				{#if isEditing}
					<input type="hidden" name="id" value={currentSchool.id} />
				{/if}

				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700" for="name">Nome</label>
					<input
						type="text"
						name="name"
						id="name"
						bind:value={currentSchool.name}
						required
						class="mt-1 block w-full border rounded-md px-3 py-2"
					/>
				</div>

				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700" for="organizationId">Organização</label>
					<select name="organizationId" id="organizationId" class="mt-1 block w-full border rounded-md px-3 py-2">
						<option value="">Nenhuma</option>
						{#each data.organizations as org}
							<option value={org.id}>{org.name}</option>
						{/each}
					</select>
				</div>

				{#if form?.message}
					<p class="text-red-500 text-sm mb-4">{form.message}</p>
				{/if}

				<div class="flex gap-2">
					<button
						type="submit"
						class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
					>
						{isEditing ? 'Salvar Alterações' : 'Criar Escola'}
					</button>
					{#if isEditing}
						<button
							type="button"
							onclick={resetForm}
							class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium"
						>
							Cancelar
						</button>
					{/if}
				</div>
			</form>
		</div>
	</div>
</div>
