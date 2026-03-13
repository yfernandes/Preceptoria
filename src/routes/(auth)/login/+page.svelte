<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import {
		Building2,
		Github,
		Mail,
		Lock,
		ArrowRight,
		ShieldCheck,
		HeartPulse
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { ActionData } from './$types';
	import { authClient } from '$lib/auth-client';

	let { form }: { form: ActionData } = $props();

	let isLoading = $state(false);

	async function signInSocial(provider: 'google' | 'github') {
		await authClient.signIn.social({
			provider,
			callbackURL: '/dashboard'
		});
	}
</script>

<div class="flex min-h-screen flex-col overflow-hidden bg-[#F9FAFB] lg:flex-row">
	<!-- Left: Marketing/Hero Side -->
	<div
		class="relative hidden flex-1 items-center justify-center overflow-hidden bg-gray-900 p-20 lg:flex"
	>
		<!-- Background Pattern -->
		<div class="absolute inset-0 z-0 opacity-20">
			<div
				class="absolute top-0 left-0 h-full w-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]"
			></div>
		</div>

		<!-- Content -->
		<div class="relative z-10 max-w-xl space-y-12 text-center">
			<div
				class="animate-in fade-in slide-in-from-top-4 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 backdrop-blur-xl duration-700"
			>
				<ShieldCheck class="h-6 w-6 text-blue-400" />
				<span class="text-xs font-bold tracking-tight tracking-widest text-white uppercase"
					>Segurança de Dados Hospitalares</span
				>
			</div>

			<h2 class="text-5xl leading-tight font-black tracking-tight text-white">
				Sua porta de entrada para uma <span class="text-blue-500 underline decoration-blue-500/30"
					>preceptoria digital</span
				> e eficiente.
			</h2>

			<p class="text-lg leading-relaxed font-medium text-gray-400">
				Gestão centralizada de estágios, documentos e convênios para instituições de ensino e saúde.
			</p>

			<div class="grid grid-cols-3 gap-8 pt-8">
				<div class="space-y-2">
					<p class="text-3xl font-black text-white">99.9%</p>
					<p class="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Conformidade</p>
				</div>
				<div class="space-y-2">
					<p class="text-3xl font-black text-white">100%</p>
					<p class="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Digital</p>
				</div>
				<div class="space-y-2">
					<p class="text-3xl font-black text-white">Zero</p>
					<p class="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Burocracia</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Right: Auth Side -->
	<div
		class="relative flex flex-1 items-center justify-center overflow-hidden bg-white p-6 md:p-12 lg:p-20"
	>
		<div
			class="absolute top-0 right-0 -z-10 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50/50 blur-3xl"
		></div>

		<div
			class="animate-in fade-in slide-in-from-bottom-4 w-full max-w-[420px] space-y-10 duration-700"
		>
			<!-- Header -->
			<div class="space-y-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-200"
					>
						<Building2 class="h-7 w-7 text-white" />
					</div>
					<h1 class="text-2xl font-black tracking-tight text-gray-900">Preceptoria</h1>
				</div>
				<div class="space-y-2">
					<h2 class="text-3xl leading-none font-bold tracking-tight text-gray-900">
						Bem-vindo de volta!
					</h2>
					<p class="text-sm font-medium tracking-tight text-gray-500">
						Insira suas credenciais para acessar sua conta.
					</p>
				</div>
			</div>

			<!-- Forms -->
			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						isLoading = false;
						update();
					};
				}}
				class="space-y-6"
			>
				<div class="space-y-4">
					<Input
						label="E-mail Acadêmico"
						name="email"
						type="email"
						placeholder="maria@universidade.edu"
						required
						class="h-12 rounded-xl border-gray-100 px-4 shadow-none focus:ring-blue-100"
					/>

					<div class="space-y-1.5">
						<div class="flex items-center justify-between px-1">
							<label class="text-sm font-bold text-gray-700" for="password">Senha</label>
							<a
								href="/forgot-password"
								class="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
								>Esqueceu a senha?</a
							>
						</div>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							required
							class="h-12 rounded-xl border-gray-100 px-4 shadow-none focus:ring-blue-100"
						/>
					</div>
				</div>

				{#if form?.message}
					<p class="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-500">
						{form.message}
					</p>
				{/if}

				<Button
					type="submit"
					class="group h-12 w-full rounded-xl text-base font-bold shadow-2xl shadow-blue-200 transition-all"
					disabled={isLoading}
				>
					{isLoading ? 'Entrando...' : 'Entrar na Conta'}
					<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
				</Button>

				<div class="relative py-4">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-100"></div>
					</div>
					<div
						class="relative flex justify-center bg-white px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase"
					>
						Ou continue com
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Button
						variant="outline"
						type="button"
						onclick={() => signInSocial('github')}
						class="flex h-12 items-center gap-2 rounded-xl border-gray-100 font-bold hover:bg-gray-50"
					>
						<Github class="h-5 w-5" />
						GitHub
					</Button>
					<Button
						variant="outline"
						type="button"
						onclick={() => signInSocial('google')}
						class="flex h-12 items-center gap-2 rounded-xl border-gray-100 font-bold hover:bg-gray-50"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</Button>
				</div>
			</form>

			<div class="pt-8 text-center">
				<p class="text-sm font-medium text-gray-500">
					Ainda não tem uma conta?
					<a href="/signup" class="font-bold text-blue-600 transition-colors hover:text-blue-700"
						>Crie uma agora</a
					>
				</p>
			</div>

			<!-- Footer info -->
			<div
				class="flex items-center justify-center gap-6 pt-10 text-[10px] font-bold tracking-widest text-gray-300 uppercase"
			>
				<span class="flex items-center gap-1"
					><HeartPulse class="h-3.5 w-3.5" /> Focado em Saúde</span
				>
				<span class="flex items-center gap-1"
					><ShieldCheck class="h-3.5 w-3.5" /> GDPR Compliant</span
				>
			</div>
		</div>
	</div>
</div>
