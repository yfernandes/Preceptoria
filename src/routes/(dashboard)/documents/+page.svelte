<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData, ActionData } from "./$types";
	import Button from "$lib/components/ui/Button.svelte";
	import Card from "$lib/components/ui/Card.svelte";
	import Badge from "$lib/components/ui/Badge.svelte";
	import {
		Upload,
		FileText,
		Clock,
		CheckCircle2,
		AlertCircle,
		MoreVertical,
		Eye,
		History,
		Search,
		Filter,
		XCircle,
		ExternalLink,
		ChevronRight,
		ShieldCheck,
	} from "lucide-svelte";

	import { invalidateAll } from "$app/navigation";
	import { cn } from "$lib/utils";
	let { data, form }: { data: PageData; form: ActionData } = $props();

	const documentsWithWarnings = $derived(
		data.documents.map((doc) => {
			if (!doc.expiresAt) return { ...doc, isExpiringSoon: false, isExpired: false };
			const daysUntilExpiry = Math.ceil(
				(new Date(doc.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
			);
			return {
				...doc,
				isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
				isExpired: daysUntilExpiry <= 0,
			};
		})
	);

	let uploadFile: File | null = $state(null);
	let selectedType = $state("VACCINATION_CARD");
	let isUploading = $state(false);

	async function handleUpload(e: Event) {
		e.preventDefault();
		if (!uploadFile || !data.studentId) return;

		isUploading = true;

		try {
			const formData = new FormData();
			formData.append("name", uploadFile.name);
			formData.append("type", uploadFile.type);
			formData.append("documentType", selectedType);
			formData.append("studentId", data.studentId);
			formData.append("size", uploadFile.size.toString());

			const response = await fetch("?/getUploadUrl", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (result.type === "success" && result.data?.uploadUrl) {
				const { uploadUrl } = result.data;

				const uploadResponse = await fetch(uploadUrl, {
					method: "PUT",
					body: uploadFile,
					headers: {
						"Content-Type": uploadFile.type,
					},
				});

				if (uploadResponse.ok) {
					uploadFile = null;
					await invalidateAll();
				} else {
					alert("Falha ao enviar arquivo para o storage.");
				}
			} else {
				alert(result.data?.message || "Falha ao obter URL de upload.");
			}
		} catch (err) {
			console.error(err);
			alert("Erro inesperado durante o envio.");
		} finally {
			isUploading = false;
		}
	}

	const docTypeLabels: Record<string, string> = {
		VACCINATION_CARD: "Cartão de Vacinação",
		PROFESSIONAL_ID: "Identidade Profissional",
		COMMITMENT_CONTRACT: "Termo de Compromisso",
		ADMISSION_FORM: "Ficha de Admissão",
		BADGE_PICTURE: "Foto para Crachá",
		OTHER: "Outro",
	};
</script>

<div class="animate-in fade-in space-y-8 duration-500">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Gestão de Documentos</h1>
			<p class="mt-1 text-gray-500">
				{data.isStudent
					? "Envie e acompanhe o status dos seus documentos."
					: "Revise e aprove os documentos enviados pelos alunos."}
			</p>
		</div>
		{#if !data.isStudent}
			<div class="flex gap-2">
				<Button variant="outline" size="sm">
					<History class="mr-2 h-4 w-4" />
					Histórico de Revisões
				</Button>
			</div>
		{/if}
	</div>

	{#if data.isStudent}
		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<!-- Upload Section -->
			<div class="sticky top-28 lg:col-span-4">
				<Card
					title="Enviar Novo Documento"
					description="Selecione o tipo de arquivo e envie para revisão."
				>
					<form onsubmit={handleUpload} class="space-y-6">
						<div class="space-y-2">
							<label class="text-sm font-semibold text-gray-700" for="docType"
								>Tipo de Documento</label
							>
							<select
								bind:value={selectedType}
								id="docType"
								class="w-full cursor-pointer rounded-xl border-none bg-gray-50 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100"
							>
								{#each Object.entries(docTypeLabels) as [val, label]}
									<option value={val}>{label}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<label class="text-sm font-semibold text-gray-700" for="file"
								>Arquivo (PDF, JPG, PNG)</label
							>
							<div class="group relative">
								<input
									type="file"
									id="file"
									onchange={(e) => (uploadFile = (e.target as HTMLInputElement).files?.[0] || null)}
									required
									class="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
								/>
								<div
									class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-all group-hover:border-blue-300 group-hover:bg-blue-50/50"
								>
									<div
										class="rounded-xl bg-white p-3 shadow-sm transition-transform group-hover:scale-110"
									>
										<Upload class="h-6 w-6 text-blue-600" />
									</div>
									<div class="mt-1 text-xs font-bold text-gray-900">
										{uploadFile ? uploadFile.name : "Clique para selecionar"}
									</div>
									<p class="text-[10px] font-medium text-gray-400">Tamanho máximo: 10MB</p>
								</div>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isUploading || !uploadFile}
							class="h-12 w-full rounded-xl shadow-lg shadow-blue-100"
						>
							{#if isUploading}
								<Clock class="mr-2 h-4 w-4 animate-spin" />
								Enviando...
							{:else}
								<ShieldCheck class="mr-2 h-4 w-4" />
								Enviar para Auditoria
							{/if}
						</Button>
					</form>
				</Card>
			</div>

			<!-- Student History Section -->
			<div class="space-y-6 lg:col-span-8">
				<h2 class="flex items-center gap-2 text-xl font-bold text-gray-900">
					<History class="h-5 w-5 text-gray-400" />
					Seus Documentos Recentes
				</h2>

				{#if data.documents.length === 0}
					<div
						class="rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 py-20 text-center"
					>
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm"
						>
							<FileText class="h-8 w-8 text-gray-200" />
						</div>
						<p class="font-medium text-gray-500 italic">Você ainda não enviou nenhum documento.</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4">
						{#each documentsWithWarnings as doc}
							<div
								class={cn(
									"group rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md",
									doc.isExpired
										? "border-red-200 bg-red-50/30"
										: doc.isExpiringSoon
											? "border-amber-200 bg-amber-50/30"
											: "border-gray-100 bg-white"
								)}
							>
								<div class="flex items-start justify-between">
									<div class="flex items-center gap-4">
										<div
											class={cn(
												"flex h-12 w-12 items-center justify-center rounded-xl shadow-inner transition-colors",
												doc.isExpired
													? "bg-red-100 text-red-600"
													: doc.isExpiringSoon
														? "bg-amber-100 text-amber-600"
														: "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
											)}
										>
											<FileText class="h-6 w-6" />
										</div>
										<div>
											<h3 class="leading-tight font-bold text-gray-900">{doc.name}</h3>
											<p class="mt-1 text-xs font-medium text-gray-500">
												{docTypeLabels[doc.type] || doc.type} • {new Date(
													doc.createdAt
												).toLocaleDateString()}
											</p>
											{#if doc.expiresAt}
												<div
													class={cn(
														"mt-1 flex items-center gap-1 text-[10px] font-bold tracking-tight uppercase",
														doc.isExpired
															? "text-red-600"
															: doc.isExpiringSoon
																? "text-amber-600"
																: "text-gray-400"
													)}
												>
													<AlertCircle class="h-3 w-3" />
													Expira em: {new Date(doc.expiresAt).toLocaleDateString()}
													{doc.isExpired
														? "(EXPIRADO)"
														: doc.isExpiringSoon
															? "(EXPIRA EM BREVE)"
															: ""}
												</div>
											{/if}
										</div>
									</div>

									<div class="flex items-center gap-3">
										<a
											href={doc.downloadUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
										>
											<Eye class="h-4 w-4" />
										</a>
										{#if doc.status === "APPROVED"}
											<Badge
												variant="success"
												class="border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700"
											>
												<CheckCircle2 class="mr-1 h-3 w-3" />
												Aprovado
											</Badge>
										{:else if doc.status === "REJECTED"}
											<Badge
												variant="error"
												class="border-rose-100 bg-rose-50 px-3 py-1 text-rose-700"
											>
												<XCircle class="mr-1 h-3 w-3" />
												Rejeitado
											</Badge>
										{:else}
											<Badge
												variant="warning"
												class="border-amber-100 bg-amber-50 px-3 py-1 text-amber-700"
											>
												<Clock class="mr-1 h-3 w-3" />
												Pendente
											</Badge>
										{/if}
									</div>
								</div>

								{#if doc.status === "REJECTED"}
									<div
										class="mt-4 flex gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] font-bold text-rose-700"
									>
										<AlertCircle class="h-4 w-4 shrink-0" />
										<span>Motivo: {doc.rejectionReason}</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Supervisor View -->
		<div class="space-y-6">
			<div class="flex flex-col gap-4 sm:flex-row">
				<div class="relative flex-1">
					<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar por nome do estudante ou documento..."
						class="w-full rounded-2xl border border-gray-100 bg-white py-3 pr-4 pl-10 text-sm shadow-sm transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
					/>
				</div>
				<Button variant="outline" class="flex items-center gap-2 rounded-2xl">
					<Filter class="h-4 w-4" />
					Status: Todos
				</Button>
			</div>

			<Card contentClass="p-0 overflow-visible">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-50">
						<thead>
							<tr class="bg-gray-50/50">
								<th
									class="px-8 py-5 text-left text-xs font-bold tracking-widest text-gray-400 uppercase"
									>Estudante</th
								>
								<th
									class="px-8 py-5 text-left text-xs font-bold tracking-widest text-gray-400 uppercase"
									>Documento</th
								>
								<th
									class="px-8 py-5 text-left text-xs font-bold tracking-widest text-gray-400 uppercase"
									>Status</th
								>
								<th
									class="px-8 py-5 text-right text-xs font-bold tracking-widest text-gray-400 uppercase"
									>Ações</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50">
							{#each documentsWithWarnings as doc}
								<tr class="group transition-colors hover:bg-gray-50/50">
									<td class="px-8 py-5 whitespace-nowrap">
										<div class="flex items-center gap-3">
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 shadow-inner"
											>
												{doc.student.user.name?.charAt(0)}
											</div>
											<div class="text-sm font-bold tracking-tight text-gray-900">
												{doc.student.user.name}
												{#if doc.expiresAt}
													{@const days = Math.ceil(
														(new Date(doc.expiresAt).getTime() - new Date().getTime()) /
															(1000 * 60 * 60 * 24)
													)}
													{#if days <= 30}
														<span
															class={cn(
																"ml-2 rounded-full px-2 py-0.5 text-[8px] font-black uppercase",
																days <= 0
																	? "bg-red-100 text-red-600"
																	: "bg-amber-100 text-amber-600"
															)}
														>
															{days <= 0 ? "Expirado" : "Expira em breve"}
														</span>
													{/if}
												{/if}
											</div>
										</div>
									</td>
									<td class="px-8 py-5 whitespace-nowrap">
										<div class="mb-1 text-sm leading-none font-bold text-gray-900">{doc.name}</div>
										<div class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
											{docTypeLabels[doc.type] || doc.type}
										</div>
									</td>
									<td class="px-8 py-5 whitespace-nowrap">
										{#if doc.status === "APPROVED"}
											<Badge
												variant="success"
												class="border-none bg-emerald-50 font-bold text-emerald-700">APROVADO</Badge
											>
										{:else if doc.status === "REJECTED"}
											<Badge variant="error" class="border-none bg-rose-50 font-bold text-rose-700"
												>REJEITADO</Badge
											>
										{:else}
											<Badge
												variant="warning"
												class="border-none bg-amber-50 font-bold text-amber-700">PENDENTE</Badge
											>
										{/if}
									</td>
									<td class="px-8 py-5 text-right whitespace-nowrap">
										<div class="flex items-center justify-end gap-2">
											<a
												href={doc.downloadUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="flex h-9 items-center justify-center rounded-xl border border-blue-100 bg-white px-4 text-xs font-bold text-blue-600 shadow-sm transition-all hover:bg-blue-50"
											>
												<Eye class="mr-2 h-4 w-4" />
												Analisar
											</a>

											{#if doc.status === "PENDING"}
												<div class="flex gap-2">
													<form method="POST" action="?/approve" use:enhance>
														<input type="hidden" name="id" value={doc.id} />
														<Button
															type="submit"
															variant="ghost"
															size="icon"
															class="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
														>
															<CheckCircle2 class="h-4 w-4" />
														</Button>
													</form>
													<form
														method="POST"
														action="?/reject"
														use:enhance={({ formData }) => {
															const reason = prompt("Motivo da rejeição:");
															if (!reason) return;
															formData.set("reason", reason);
														}}
													>
														<input type="hidden" name="id" value={doc.id} />
														<Button
															type="submit"
															variant="ghost"
															size="icon"
															class="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
														>
															<XCircle class="h-4 w-4" />
														</Button>
													</form>
												</div>
											{/if}
										</div>
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
