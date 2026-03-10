<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-6">Dashboard</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="bg-white p-6 rounded shadow border-l-4 border-blue-600">
			<p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total de Estudantes</p>
			<p class="text-3xl font-bold text-gray-900">{data.stats.students}</p>
		</div>

		<div class="bg-white p-6 rounded shadow border-l-4 border-green-600">
			<p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Hospitais</p>
			<p class="text-3xl font-bold text-gray-900">{data.stats.hospitals}</p>
		</div>

		<div class="bg-white p-6 rounded shadow border-l-4 border-yellow-600">
			<p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Documentos Pendentes</p>
			<p class="text-3xl font-bold text-gray-900">{data.stats.pendingDocuments}</p>
		</div>

		<div class="bg-white p-6 rounded shadow border-l-4 border-purple-600">
			<p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Estágios Ativos</p>
			<p class="text-3xl font-bold text-gray-900">{data.stats.activePlacements}</p>
		</div>
	</div>

	<div class="mt-8 bg-white p-6 rounded shadow">
		<h2 class="text-xl font-semibold mb-4">Bem-vindo ao sistema de Preceptoria</h2>
		<p class="text-gray-600">
			Utilize o menu lateral para gerenciar os recursos do sistema.
		</p>
	</div>
</div>
