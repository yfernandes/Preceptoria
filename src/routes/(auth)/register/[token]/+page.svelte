<script lang="ts">
import type { ActionData, PageData } from "./$types"

let { data, form }: { data: PageData; form: ActionData } = $props()

let _success = $state(false)

const _roleNames: Record<string, string> = {
	Student: "Estudante",
	Preceptor: "Preceptor",
	Supervisor: "Supervisor",
}
</script>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F9FAFB] p-6 md:p-12"
>
	<!-- Background abstract elements -->
	<div
		class="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-50/50 blur-[100px]"
	></div>
	<div
		class="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 animate-pulse rounded-full bg-indigo-50/50 blur-[100px] delay-1000"
	></div>

	<div
		class="animate-in fade-in slide-in-from-bottom-4 w-full max-w-[540px] space-y-8 duration-700"
	>
		<!-- Brand -->
		<div class="flex flex-col items-center gap-6">
			<div class="flex items-center gap-3">
				<div
					class="flex h-12 w-12 rotate-3 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-200"
				>
					<Building2 class="h-7 w-7 text-white" />
				</div>
				<h1 class="text-3xl font-black tracking-tight text-gray-900">Preceptoria</h1>
			</div>
		</div>

		<Card
			class="overflow-visible border-none bg-white/90 p-2 shadow-2xl shadow-blue-900/10 backdrop-blur-sm"
		>
			<div class="p-6 md:p-8">
				{#if form?.success || success}
					<div class="animate-in fade-in zoom-in space-y-6 py-8 text-center duration-500">
						<div
							class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
						>
							<CheckCircle2 class="h-10 w-10" />
						</div>
						<div class="space-y-2">
							<h2 class="text-3xl font-black tracking-tight text-gray-900">Cadastro Realizado!</h2>
							<p class="text-gray-500">
								Sua conta foi criada com sucesso. Você já pode acessar a plataforma.
							</p>
						</div>
						<a
							href="/login"
							class="flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 text-base font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-700"
						>
							Fazer Login
							<ArrowRight class="ml-2 h-5 w-5" />
						</a>
					</div>
				{:else}
					<div class="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
						<div class="space-y-2 text-center">
							<div class="mb-4 flex justify-center">
								<Badge
									variant="info"
									class="bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-widest text-blue-700 uppercase"
								>
									CONVITE ACEITO
								</Badge>
							</div>
							<h2 class="text-3xl font-black tracking-tight text-gray-900">Complete seu Perfil</h2>
							<p class="text-sm font-medium text-gray-500">
								Você foi convidado como <span class="font-bold text-blue-600"
									>{roleNames[data.invitation.role] || data.invitation.role}</span
								>
								{#if data.invitation.class}
									para a turma <span class="font-bold text-blue-600"
										>{data.invitation.class.name}</span
									>.
								{/if}
							</p>
						</div>

						<form method="POST" use:enhance class="space-y-5">
							<div class="space-y-4">
								<div class="space-y-1.5">
									<label
										class="text-xs font-bold tracking-widest text-gray-400 uppercase"
										for="email">E-mail</label
									>
									<Input
										value={data.invitation.email}
										disabled
										class="h-12 cursor-not-allowed rounded-xl border-gray-100 bg-gray-50"
									/>
									<p class="text-[10px] font-medium text-gray-400">
										O e-mail não pode ser alterado neste convite.
									</p>
								</div>

								<Input
									label="Nome Completo"
									name="name"
									placeholder="Ex: Maria Silva"
									required
									class="h-12 rounded-xl"
								/>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<Input
										label="Senha"
										name="password"
										type="password"
										placeholder="••••••••"
										required
										class="h-12 rounded-xl"
									/>
									<Input
										label="Confirmar"
										name="confirmPassword"
										type="password"
										placeholder="••••••••"
										required
										class="h-12 rounded-xl"
									/>
								</div>
							</div>

							{#if form?.message}
								<div
									class="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600"
								>
									<AlertCircle class="h-4 w-4" />
									{form.message}
								</div>
							{/if}

							<Button
								type="submit"
								class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-black shadow-xl shadow-blue-500/20"
							>
								<Lock class="mr-2 h-4 w-4" />
								Finalizar Cadastro
							</Button>
						</form>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Footer security info -->
		<div
			class="flex items-center justify-center gap-6 pt-4 text-[10px] font-bold tracking-widest text-gray-300 uppercase"
		>
			<span class="flex items-center gap-1"><ShieldCheck class="h-3.5 w-3.5" /> Segurança SSL</span>
			<span class="flex items-center gap-1"><Lock class="h-3.5 w-3.5" /> Encriptação de Ponta</span>
		</div>
	</div>
</div>
