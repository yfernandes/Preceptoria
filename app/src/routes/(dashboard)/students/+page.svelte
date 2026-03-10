<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreating = $state(false);

	function toggleCreate() {
		isCreating = !isCreating;
	}
</script>

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">Gestão de Estudantes</h1>
		<button
			onclick={toggleCreate}
			class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
		>
			{isCreating ? 'Voltar para Lista' : 'Novo Estudante'}
		</button>
	</div>

	{#if isCreating}
		<div class="bg-white p-6 rounded shadow max-w-lg mx-auto">
			<h2 class="text-xl font-semibold mb-4">Cadastrar Novo Estudante</h2>
			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						isCreating = false;
					}
				};
			}}>
				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700" for="name">Nome Completo</label>
					<input
						type="text"
						name="name"
						id="name"
						required
						class="mt-1 block w-full border rounded-md px-3 py-2"
					/>
				</div>

				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700" for="email">Email</label>
					<input
						type="email"
						name="email"
						id="email"
						required
						class="mt-1 block w-full border rounded-md px-3 py-2"
					/>
				</div>

				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700" for="classId">Turma</label>
					<select name="classId" id="classId" required class="mt-1 block w-full border rounded-md px-3 py-2">
						<option value="">Selecione uma turma</option>
						{#each data.classes as classItem}
							<option value={classItem.id}>{classItem.name} ({classItem.course.name})</option>
						{/each}
					</select>
				</div>

				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700" for="registrationNumber">Matrícula (Opcional)</label>
					<input
						type="text"
						name="registrationNumber"
						id="registrationNumber"
						class="mt-1 block w-full border rounded-md px-3 py-2"
					/>
				</div>

				{#if form?.message}
					<p class="text-red-500 text-sm mb-4">{form.message}</p>
				{/if}

				<div class="flex gap-2">
					<button
						type="submit"
						class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium w-full"
					>
						Criar Estudante
					</button>
				</div>
			</form>
		</div>
	{:else}
		<div class="bg-white rounded shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.students as student}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{student.user.name}</div>
								<div class="text-xs text-gray-500">{student.registrationNumber || 'Sem matrícula'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{student.user.email}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{student.class.name}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={student.id} />
									<button type="submit" class="text-red-600 hover:text-red-900">Excluir</button>
								</form>
							</td>
						</tr>
					{/each}
					{#if data.students.length === 0}
						<tr>
							<td colspan="4" class="px-6 py-10 text-center text-gray-500 italic">
								Nenhum estudante cadastrado.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>
