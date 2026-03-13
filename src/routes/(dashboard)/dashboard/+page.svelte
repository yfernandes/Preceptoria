<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		Users,
		Hospital,
		FileText,
		Briefcase,
		ArrowUpRight,
		Clock,
		CheckCircle2,
		AlertCircle
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const stats = $derived([
		{
			name: 'Total de Estudantes',
			value: data.stats.students,
			icon: Users,
			color: 'text-blue-600',
			bg: 'bg-blue-50',
			trend: '+12% este mês'
		},
		{
			name: 'Hospitais',
			value: data.stats.hospitals,
			icon: Hospital,
			color: 'text-green-600',
			bg: 'bg-green-50',
			trend: 'Ativos'
		},
		{
			name: 'Documentos Pendentes',
			value: data.stats.pendingDocuments,
			icon: FileText,
			color: 'text-orange-600',
			bg: 'bg-orange-50',
			trend: 'Urgente'
		},
		{
			name: 'Estágios Ativos',
			value: data.stats.activePlacements,
			icon: Briefcase,
			color: 'text-purple-600',
			bg: 'bg-purple-50',
			trend: 'Em andamento'
		}
	]);

	// Mock recent activity for the vibe check
	const activities = [
		{
			id: 1,
			user: 'Maria Silva',
			action: 'enviou um novo documento',
			time: 'Há 5 minutos',
			type: 'upload'
		},
		{
			id: 2,
			user: 'João Pereira',
			action: 'completou o estágio',
			time: 'Há 2 horas',
			type: 'complete'
		},
		{
			id: 3,
			user: 'Hospital Santa Luzia',
			action: 'solicitou novos estagiários',
			time: 'Há 5 horas',
			type: 'request'
		},
		{ id: 4, user: 'Ana Costa', action: 'teve documento rejeitado', time: 'Ontem', type: 'reject' }
	];
</script>

<div class="animate-in fade-in space-y-10 duration-500">
	<header>
		<h1 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
		<p class="mt-1 text-gray-500">
			Bem-vindo de volta! Aqui está um resumo do que está acontecendo hoje.
		</p>
	</header>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<Card class="transition-shadow hover:shadow-md">
				<div class="mb-4 flex items-center justify-between">
					<div class={stat.bg + ' rounded-xl p-3 ' + stat.color}>
						<stat.icon class="h-6 w-6" />
					</div>
					<Badge variant="neutral" class="border-none bg-gray-50 font-medium text-gray-500">
						{stat.trend}
					</Badge>
				</div>
				<div>
					<p class="text-sm font-medium tracking-wider text-gray-500 uppercase">{stat.name}</p>
					<h3 class="mt-1 text-3xl font-bold text-gray-900">{stat.value}</h3>
				</div>
			</Card>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Welcome & Main Info -->
		<Card
			title="Atividades Recentes"
			description="Últimas interações no sistema de preceptoria"
			class="lg:col-span-2"
		>
			<div class="mt-4 space-y-6">
				{#each activities as activity}
					<div
						class="group flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-gray-50"
					>
						<div class="mt-1">
							{#if activity.type === 'upload'}
								<Clock class="h-5 w-5 text-blue-500" />
							{:else if activity.type === 'complete'}
								<CheckCircle2 class="h-5 w-5 text-green-500" />
							{:else if activity.type === 'reject'}
								<AlertCircle class="h-5 w-5 text-red-500" />
							{:else}
								<Briefcase class="h-5 w-5 text-purple-500" />
							{/if}
						</div>
						<div class="flex-1">
							<p class="text-sm text-gray-900">
								<span class="font-bold">{activity.user}</span>
								{activity.action}
							</p>
							<p class="mt-1 text-xs text-gray-500">{activity.time}</p>
						</div>
						<button
							class="text-xs font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100"
						>
							Ver detalhes
						</button>
					</div>
				{/each}
			</div>

			{#snippet footer()}
				<div class="flex justify-center">
					<button
						class="flex items-center gap-1 px-4 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
					>
						Ver todo o histórico <ArrowUpRight class="h-4 w-4" />
					</button>
				</div>
			{/snippet}
		</Card>

		<!-- Secondary Info -->
		<div class="space-y-6">
			<Card title="Status do Sistema" class="border-none bg-blue-600 text-white shadow-blue-200">
				<div class="space-y-4 text-blue-50">
					<div class="flex items-center justify-between border-b border-blue-500/30 pb-3 text-sm">
						<span>Documentos Verificados</span>
						<span class="font-bold">85%</span>
					</div>
					<div class="flex items-center justify-between border-b border-blue-500/30 pb-3 text-sm">
						<span>Estágios Finalizados</span>
						<span class="font-bold">124</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<span>Hospitais Conectados</span>
						<span class="font-bold">12</span>
					</div>
				</div>
				{#snippet footer()}
					<button
						class="w-full rounded-lg bg-white/10 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
					>
						Gerar Relatório Mensal
					</button>
				{/snippet}
			</Card>

			<Card title="Suporte">
				<p class="mb-4 text-sm text-gray-500">Precisa de ajuda com o sistema de preceptoria?</p>
				<button
					class="w-full rounded-lg border border-gray-200 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
				>
					Acessar Central de Ajuda
				</button>
			</Card>
		</div>
	</div>
</div>
