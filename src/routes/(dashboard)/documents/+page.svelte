<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let uploadFile: File | null = $state(null);
	let selectedType = $state('VACCINATION_CARD');
	let isUploading = $state(false);

	async function handleUpload(e: Event) {
		e.preventDefault();
		if (!uploadFile || !data.studentId) return;

		isUploading = true;

		try {
			// 1. Get presigned URL via action
			const formData = new FormData();
			formData.append('name', uploadFile.name);
			formData.append('type', uploadFile.type);
			formData.append('documentType', selectedType);
			formData.append('studentId', data.studentId);

			const response = await fetch('?/getUploadUrl', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			// result is stringified JSON from SvelteKit action
			const actionResult = JSON.parse(result.data);
			
			if (actionResult[1]?.uploadUrl) {
				const uploadUrl = actionResult[1].uploadUrl;
				
				// 2. Upload to R2 directly from client
				await fetch(uploadUrl, {
					method: 'PUT',
					body: uploadFile,
					headers: {
						'Content-Type': uploadFile.type
					}
				});

				alert('Documento enviado com sucesso!');
				window.location.reload();
			}
		} catch (err) {
			console.error(err);
			alert('Falha ao enviar documento.');
		} finally {
			isUploading = false;
		}
	}
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-6">Documentos</h1>

	{#if data.isStudent}
		<!-- Student View: Upload and My Documents -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div class="lg:col-span-1 bg-white p-6 rounded shadow h-fit">
				<h2 class="text-xl font-semibold mb-4">Enviar Novo Documento</h2>
				<form onsubmit={handleUpload}>
					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700" for="docType">Tipo de Documento</label>
						<select bind:value={selectedType} id="docType" class="mt-1 block w-full border rounded-md px-3 py-2">
							<option value="VACCINATION_CARD">Cartão de Vacinação</option>
							<option value="PROFESSIONAL_ID">Identidade Profissional (Crefito)</option>
							<option value="COMMITMENT_CONTRACT">Termo de Compromisso</option>
							<option value="ADMISSION_FORM">Ficha de Admissão</option>
							<option value="BADGE_PICTURE">Foto para Crachá</option>
							<option value="OTHER">Outro</option>
						</select>
					</div>

					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700" for="file">Arquivo</label>
						<input
							type="file"
							id="file"
							onchange={(e) => (uploadFile = (e.target as HTMLInputElement).files?.[0] || null)}
							required
							class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						/>
					</div>

					<button
						type="submit"
						disabled={isUploading}
						class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium disabled:bg-blue-300"
					>
						{isUploading ? 'Enviando...' : 'Enviar Documento'}
					</button>
				</form>
			</div>

			<div class="lg:col-span-2 bg-white p-6 rounded shadow">
				<h2 class="text-xl font-semibold mb-4">Meus Documentos</h2>
				{#if data.documents.length === 0}
					<p class="text-gray-500 italic">Você ainda não enviou nenhum documento.</p>
				{:else}
					<div class="space-y-4">
						{#each data.documents as doc}
							<div class="border rounded p-4 flex justify-between items-center">
								<div>
									<p class="font-medium">{doc.name}</p>
									<p class="text-xs text-gray-500">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
								</div>
								<div class="flex items-center gap-4">
									<span class="px-2 py-1 rounded text-xs font-bold {doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' : doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
										{doc.status}
									</span>
									{#if doc.status === 'REJECTED'}
										<p class="text-xs text-red-600 max-w-xs">{doc.rejectionReason}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Supervisor/Admin View: Verification Queue -->
		<div class="bg-white p-6 rounded shadow">
			<h2 class="text-xl font-semibold mb-4">Fila de Verificação</h2>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudante</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.documents as doc}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{doc.student.user.name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									<div>{doc.name}</div>
									<div class="text-xs">{doc.type}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 py-1 rounded text-xs font-bold {doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' : doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
										{doc.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex gap-2">
										<a href="/documents/{doc.id}" class="text-blue-600 hover:underline">Ver</a>
										{#if doc.status === 'PENDING'}
											<form method="POST" action="?/approve" use:enhance>
												<input type="hidden" name="id" value={doc.id} />
												<button type="submit" class="text-green-600 hover:underline">Aprovar</button>
											</form>
											<button onclick={() => {
												const reason = prompt('Motivo da rejeição:');
												if (reason) {
													const formData = new FormData();
													formData.append('id', doc.id);
													formData.append('reason', reason);
													fetch('?/reject', { method: 'POST', body: formData }).then(() => window.location.reload());
												}
											}} class="text-red-600 hover:underline">Rejeitar</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
