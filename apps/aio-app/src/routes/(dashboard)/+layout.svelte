<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any, data: LayoutData } = $props();

	const navItems = [
		{ name: 'Dashboard', href: '/' },
		{ name: 'Hospitais', href: '/hospitals' },
		{ name: 'Escolas', href: '/schools' },
		{ name: 'Organizações', href: '/organizations' },
		{ name: 'Estudantes', href: '/students' },
		{ name: 'Documentos', href: '/documents' }
	];
</script>

<div class="flex h-screen bg-gray-100">
	<!-- Sidebar -->
	<aside class="w-64 bg-white shadow-md hidden md:block">
		<div class="p-6">
			<h1 class="text-xl font-bold text-blue-600">Preceptoria</h1>
		</div>
		<nav class="mt-6">
			{#each navItems as item}
				<a
					href={item.href}
					class="block px-6 py-3 text-sm font-medium border-l-4 transition-colors {page.url.pathname === item.href ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:bg-gray-50'}"
				>
					{item.name}
				</a>
			{/each}
		</nav>
	</aside>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Header -->
		<header class="bg-white shadow-sm h-16 flex items-center justify-between px-6">
			<div class="md:hidden font-bold text-blue-600">Preceptoria</div>
			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-600">{data.user?.name} ({data.user?.role})</span>
				<form method="POST" action="/demo/better-auth?/signOut">
					<button type="submit" class="text-xs text-red-600 hover:underline">Sair</button>
				</form>
			</div>
		</header>

		<!-- Content -->
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
