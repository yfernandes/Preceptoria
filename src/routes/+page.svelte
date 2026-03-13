<script lang="ts">
import { Building2, FileCheck, ShieldCheck, Users } from "lucide-svelte"

let _isMenuOpen = $state(false)

const _features = [
	{
		title: "Gestão de Convênios",
		description:
			"Controle total sobre contratos entre instituições de ensino e unidades hospitalares.",
		icon: Building2,
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	{
		title: "Auditoria de Documentos",
		description: "Fluxo automatizado para validação de vacinas, contratos e seguros obrigatórios.",
		icon: ShieldCheck,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
	},
	{
		title: "Portal do Estudante",
		description:
			"Interface intuitiva para que alunos enviem documentação e acompanhem seus estágios.",
		icon: Users,
		color: "text-indigo-600",
		bg: "bg-indigo-50",
	},
	{
		title: "Relatórios de Conformidade",
		description:
			"Gere documentos e certificados de estágio com um clique, garantindo segurança jurídica.",
		icon: FileCheck,
		color: "text-amber-600",
		bg: "bg-amber-50",
	},
]
</script>

<div
	class="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900"
>
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
		<div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200"
				>
					<Building2 class="h-6 w-6 text-white" />
				</div>
				<span
					class="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-xl font-bold tracking-tight text-transparent"
				>
					Preceptoria
				</span>
			</div>

			<!-- Desktop Nav -->
			<div class="hidden items-center gap-8 md:flex">
				<a
					href={resolve("#features")}
					class="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600"
					>Funcionalidades</a
				>
				<a
					href={resolve("#about")}
					class="text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600">Sobre</a
				>
				<div class="h-6 w-px bg-gray-100"></div>
				<a
					href={resolve("/login")}
					class="text-sm font-bold text-gray-900 transition-colors hover:text-blue-600">Entrar</a
				>
				<Button
					onclick={() => (window.location.href = "/signup")}
					class="rounded-full px-6 shadow-md shadow-blue-100"
				>
					Começar Agora
				</Button>
			</div>

			<!-- Mobile Toggle -->
			<button class="p-2 text-gray-600 md:hidden" onclick={() => (isMenuOpen = !isMenuOpen)}>
				{#if isMenuOpen}
					<X class="h-6 w-6" />
				{:else}
					<Menu class="h-6 w-6" />
				{/if}
			</button>
		</div>

		<!-- Mobile Menu -->
		{#if isMenuOpen}
			<div
				class="animate-in slide-in-from-top space-y-4 border-b border-gray-100 bg-white p-6 duration-300 md:hidden"
			>
				<a href={resolve("#features")} class="block py-2 text-base font-bold text-gray-900"
					>Funcionalidades</a
				>
				<a href={resolve("/login")} class="block py-2 text-base font-bold text-gray-900">Entrar</a>
				<Button onclick={() => (window.location.href = "/signup")} class="w-full rounded-xl py-4"
					>Criar Conta Gratuita</Button
				>
			</div>
		{/if}
	</nav>

	<!-- Hero Section -->
	<main>
		<section class="relative overflow-hidden pt-20 pb-32">
			<!-- Background blobs -->
			<div
				class="pointer-events-none absolute top-0 left-1/2 -z-10 h-full w-full max-w-7xl -translate-x-1/2"
			>
				<div
					class="animate-blob absolute top-20 left-0 h-96 w-96 rounded-full bg-blue-50 opacity-70 mix-blend-multiply blur-3xl filter"
				></div>
				<div
					class="animate-blob animation-delay-2000 absolute top-40 right-0 h-96 w-96 rounded-full bg-indigo-50 opacity-70 mix-blend-multiply blur-3xl filter"
				></div>
			</div>

			<div class="mx-auto max-w-7xl px-6 text-center">
				<div
					class="animate-in fade-in slide-in-from-bottom-4 mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold tracking-widest text-blue-700 uppercase duration-500"
				>
					<span class="relative flex h-2 w-2">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"
						></span>
						<span class="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
					</span>
					Plataforma de Gestão de Preceptoria v2.0
				</div>

				<h1
					class="animate-in fade-in slide-in-from-bottom-8 mb-8 text-5xl leading-[1.1] font-black tracking-tight text-gray-900 delay-150 duration-700 md:text-7xl"
				>
					Conectando <span class="text-blue-600">Ensino</span> e <br class="hidden md:block" />
					<span class="text-indigo-600">Saúde</span> com Segurança.
				</h1>

				<p
					class="animate-in fade-in slide-in-from-bottom-12 mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-medium text-gray-500 delay-300 duration-1000 md:text-xl"
				>
					Simplifique a gestão de estágios hospitalares, automatize a conferência de documentos e
					garanta conformidade para sua instituição de ensino.
				</p>

				<div
					class="animate-in fade-in slide-in-from-bottom-16 flex flex-col items-center justify-center gap-4 delay-500 duration-1000 sm:flex-row"
				>
					<Button
						onclick={() => (window.location.href = "/signup")}
						class="group h-14 rounded-full px-10 text-lg shadow-2xl shadow-blue-500/30"
					>
						Começar Agora
						<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
					<Button
						variant="ghost"
						onclick={() => (window.location.href = "/login")}
						class="h-14 rounded-full px-10 text-lg font-bold text-gray-600"
					>
						Agendar Demonstração
					</Button>
				</div>

				<!-- Social Proof / Stats -->
				<div
					class="mx-auto mt-24 grid max-w-4xl grid-cols-2 gap-8 border-t border-gray-100 pt-12 text-center opacity-70 md:grid-cols-4"
				>
					<div>
						<p class="text-3xl font-black tracking-tight text-gray-900">10k+</p>
						<p class="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
							Alunos Ativos
						</p>
					</div>
					<div>
						<p class="text-3xl font-black tracking-tight text-gray-900">50+</p>
						<p class="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">Hospitais</p>
					</div>
					<div>
						<p class="text-3xl font-black tracking-tight text-gray-900">150+</p>
						<p class="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">Convênios</p>
					</div>
					<div>
						<p class="text-3xl font-black tracking-tight text-gray-900">99.9%</p>
						<p class="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
							Conformidade
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section id="features" class="bg-gray-50/50 py-32">
			<div class="mx-auto max-w-7xl px-6">
				<div class="mb-20 text-center">
					<h2 class="mb-4 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
						Tudo que você precisa para <br /> uma gestão eficiente.
					</h2>
					<p class="mx-auto max-w-xl font-medium text-gray-500">
						Desenvolvido especificamente para os desafios da preceptoria em saúde no Brasil.
					</p>
				</div>

				<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					{#each features as feature (feature.title)}
						<div
							class="group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
						>
							<div
								class={cn(
									"mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110",
									feature.bg,
									feature.color
								)}
							>
								<feature.icon class="h-7 w-7" />
							</div>
							<h3 class="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
							<p class="text-sm leading-relaxed font-medium text-gray-500">
								{feature.description}
							</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Trust / CTA -->
		<section class="overflow-hidden py-32">
			<div class="mx-auto max-w-5xl px-6">
				<div class="relative overflow-hidden rounded-[3rem] bg-gray-900 p-8 shadow-2xl md:p-20">
					<!-- Abstract background for CTA -->
					<div
						class="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl"
					></div>
					<div
						class="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl"
					></div>

					<div class="relative z-10 space-y-8 text-center">
						<h2 class="text-3xl leading-tight font-black tracking-tight text-white md:text-5xl">
							Pronto para modernizar sua <br /> gestão de preceptoria?
						</h2>
						<p class="mx-auto max-w-xl text-lg text-gray-400">
							Junte-se a dezenas de instituições que já automatizaram seus processos com segurança e
							agilidade.
						</p>
						<div class="pt-4">
							<Button
								onclick={() => (window.location.href = "/signup")}
								class="h-16 rounded-full border-none bg-white px-12 text-lg font-black text-blue-600 shadow-xl shadow-white/10 hover:bg-gray-100"
							>
								Começar Teste Grátis
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-100 bg-white px-6 py-16">
		<div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
			<div class="flex items-center gap-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
					<Building2 class="h-5 w-5 text-white" />
				</div>
				<span class="text-lg font-bold tracking-tight text-gray-900">Preceptoria</span>
			</div>

			<div class="flex gap-8 text-sm font-bold text-gray-400">
				<a href="javascript:void(0)" class="transition-colors hover:text-blue-600">Termos</a>
				<a href="javascript:void(0)" class="transition-colors hover:text-blue-600">Privacidade</a>
				<a href="javascript:void(0)" class="transition-colors hover:text-blue-600">Contato</a>
			</div>

			<p class="text-xs font-bold tracking-widest text-gray-300 uppercase">
				&copy; 2024 Preceptoria V2. All rights reserved.
			</p>
		</div>
	</footer>
</div>

<style>
	@keyframes blob {
		0% {
			transform: translate(0px, 0px) scale(1);
		}
		33% {
			transform: translate(30px, -50px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
		100% {
			transform: translate(0px, 0px) scale(1);
		}
	}
	.animate-blob {
		animation: blob 7s infinite;
	}
	.animation-delay-2000 {
		animation-delay: 2s;
	}
</style>
