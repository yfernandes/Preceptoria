<script lang="ts">
import { Building2, Hospital } from "lucide-svelte"

let step = $state(1)
let _selectedRole = $state("PRECEPTOR")

const _roles = [
	{
		id: "PRECEPTOR",
		name: "Preceptor",
		icon: Hospital,
		description: "Acompanhe seus alunos e valide frequências.",
		color: "text-emerald-600",
		bg: "bg-emerald-50",
	},
	{
		id: "INSTITUTION",
		name: "Instituição",
		icon: Building2,
		description: "Gerencie convênios, documentos e auditorias.",
		color: "text-indigo-600",
		bg: "bg-indigo-50",
	},
]

function _nextStep() {
	if (step < 2) step++
}
function _prevStep() {
	if (step > 1) step--
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
		<!-- Brand & Progress -->
		<div class="flex flex-col items-center gap-6">
			<div class="flex items-center gap-3">
				<div
					class="flex h-12 w-12 rotate-3 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-200"
				>
					<Building2 class="h-7 w-7 text-white" />
				</div>
				<h1 class="text-3xl font-black tracking-tight text-gray-900">Preceptoria</h1>
			</div>

			<div class="flex w-full items-center gap-4 px-12">
				<div
					class={cn(
						"h-1.5 flex-1 rounded-full transition-all duration-500",
						step >= 1 ? "bg-blue-600 shadow-sm shadow-blue-200" : "bg-gray-200"
					)}
				></div>
				<div
					class={cn(
						"h-1.5 flex-1 rounded-full transition-all duration-500",
						step >= 2 ? "bg-blue-600 shadow-sm shadow-blue-200" : "bg-gray-200"
					)}
				></div>
			</div>
		</div>

		<Card
			class="overflow-visible border-none bg-white/90 p-2 shadow-2xl shadow-blue-900/10 backdrop-blur-sm"
		>
			<div class="p-6 md:p-8">
				{#if step === 1}
					<div class="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
						<div class="space-y-2 text-center">
							<h2 class="text-3xl font-black tracking-tight text-gray-900">
								Crie sua conta gratuita
							</h2>
							<p class="text-sm font-medium text-gray-500">
								Selecione o seu perfil de usuário para começar.
							</p>
						</div>

						<div class="grid grid-cols-1 gap-4">
							{#each roles as role (role.id)}
								<button
									onclick={() => (selectedRole = role.id)}
									class={cn(
										"group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
										selectedRole === role.id
											? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10"
											: "border-gray-100 bg-white hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-900/5"
									)}
								>
									<div
										class={cn(
											"rounded-xl p-3 shadow-inner transition-transform group-hover:scale-110",
											role.bg,
											role.color
										)}
									>
										<role.icon class="h-6 w-6" />
									</div>
									<div class="flex-1">
										<h3 class="text-base font-bold text-gray-900">{role.name}</h3>
										<p class="mt-1 text-xs leading-relaxed font-medium text-gray-500">
											{role.description}
										</p>
									</div>
									{#if selectedRole === role.id}
										<div
											class="animate-in zoom-in absolute top-5 right-5 text-blue-600 duration-300"
										>
											<CheckCircle2 class="h-5 w-5" />
										</div>
									{/if}
								</button>
							{/each}
						</div>

						<div class="rounded-2xl border border-blue-100 bg-blue-50/30 p-5">
							<div class="flex gap-4">
								<div class="rounded-xl bg-blue-50 p-2 text-blue-600">
									<GraduationCap class="h-5 w-5" />
								</div>
								<div>
									<h4 class="text-sm font-bold text-gray-900">É um estudante?</h4>
									<p class="mt-1 text-xs leading-relaxed font-medium text-gray-500">
										Estudantes devem ser convidados por seus supervisores para acessar a plataforma.
										Verifique seu e-mail institucional pelo link de convite.
									</p>
								</div>
							</div>
						</div>

						<Button
							onclick={nextStep}
							class="group h-14 w-full rounded-2xl text-base font-black shadow-xl shadow-blue-500/20"
						>
							Prosseguir com {roles.find((r) => r.id === selectedRole)?.name}
							<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Button>
					</div>
				{:else}
					<div class="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
						<div class="flex items-center justify-between">
							<button
								onclick={prevStep}
								class="flex items-center gap-1.5 text-xs font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-900"
							>
								<ArrowLeft class="h-3.5 w-3.5" />
								Voltar
							</button>
							<Badge
								variant="info"
								class="bg-blue-50 px-3 py-1 text-[9px] font-bold tracking-widest text-blue-700 uppercase"
							>
								{roles.find((r) => r.id === selectedRole)?.name}
							</Badge>
						</div>

						<div class="space-y-2 text-center">
							<h2 class="text-3xl font-black tracking-tight text-gray-900">Quase lá!</h2>
							<p class="text-sm font-medium text-gray-500">
								Complete seus dados para criar seu perfil.
							</p>
						</div>

						<form method="POST" class="space-y-5">
							<div class="space-y-4">
								<Input
									label="Nome Completo"
									placeholder="Ex: Maria Silva"
									required
									class="h-12 rounded-xl"
								/>
								<Input
									label="E-mail Institucional"
									type="email"
									placeholder="maria@universidade.edu"
									required
									class="h-12 rounded-xl"
								/>

								<div class="grid grid-cols-2 gap-4">
									<Input
										label="Senha"
										type="password"
										placeholder="••••••••"
										required
										class="h-12 rounded-xl"
									/>
									<Input
										label="Confirmar"
										type="password"
										placeholder="••••••••"
										required
										class="h-12 rounded-xl"
									/>
								</div>
							</div>

							<div
								class="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-5"
							>
								<div class="pt-1">
									<input
										type="checkbox"
										id="terms"
										required
										class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
								</div>
								<label for="terms" class="text-xs leading-relaxed font-medium text-gray-500">
									Eu concordo com os <a
										href="/terms"
										class="font-bold text-blue-600 hover:underline">Termos de Uso</a
									>
									e
									<a href="/privacy" class="font-bold text-blue-600 hover:underline"
										>Política de Privacidade</a
									> do sistema de preceptoria.
								</label>
							</div>

							<Button
								type="submit"
								class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-black shadow-xl shadow-blue-500/20"
							>
								<Lock class="mr-2 h-4 w-4" />
								Criar Minha Conta
							</Button>
						</form>
					</div>
				{/if}
			</div>
		</Card>

		<div class="text-center">
			<p class="text-sm font-medium text-gray-500">
				Já possui uma conta?
				<a href="/login" class="font-bold text-blue-600 transition-colors hover:text-blue-700"
					>Entrar agora</a
				>
			</p>
		</div>

		<!-- Footer security info -->
		<div
			class="flex items-center justify-center gap-6 pt-4 text-[10px] font-bold tracking-widest text-gray-300 uppercase"
		>
			<span class="flex items-center gap-1"><ShieldCheck class="h-3.5 w-3.5" /> Segurança SSL</span>
			<span class="flex items-center gap-1"><Lock class="h-3.5 w-3.5" /> Encriptação de Ponta</span>
		</div>
	</div>
</div>
