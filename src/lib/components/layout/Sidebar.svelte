<script lang="ts">
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		Hospital,
		GraduationCap,
		Building2,
		Users,
		User,
		Files,
		Settings,
		ChevronRight,
		Layers,
		Clock,
		Calendar,
		Link
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	const navItems = [
		{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Hospitais', href: '/hospitals', icon: Hospital },
		{ name: 'Preceptores', href: '/preceptors', icon: User },
		{ name: 'Escolas', href: '/schools', icon: GraduationCap },
		{ name: 'Turmas', href: '/classes', icon: Layers },
		{ name: 'Organizações', href: '/organizations', icon: Building2 },
		{ name: 'Estudantes', href: '/students', icon: Users },
		{ name: 'Vínculos', href: '/placements', icon: Link },
		{ name: 'Documentos', href: '/documents', icon: Files },
		{ name: 'Disponibilidade', href: '/availability', icon: Clock },
		{ name: 'Plantões', href: '/shifts', icon: Calendar }
	];

	const isActive = (href: string) => {
		if (href === '/dashboard') return page.url.pathname === '/dashboard';
		return page.url.pathname.startsWith(href);
	};
</script>

<aside class="flex hidden h-full w-72 flex-col border-r border-gray-100 bg-white shadow-sm md:flex">
	<div class="p-8">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200"
			>
				<Building2 class="h-6 w-6 text-white" />
			</div>
			<h1
				class="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-xl font-bold text-transparent"
			>
				Preceptoria
			</h1>
		</div>
	</div>

	<nav class="flex-1 space-y-1.5 overflow-y-auto px-4">
		<p class="mb-4 px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
			Menu Principal
		</p>

		{#each navItems as item}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				class={cn(
					'group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
					active
						? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-50'
						: 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
				)}
			>
				<div class="flex items-center gap-3">
					<item.icon
						class={cn(
							'h-5 w-5 transition-colors',
							active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
						)}
					/>
					<span>{item.name}</span>
				</div>
				{#if active}
					<ChevronRight class="h-4 w-4 text-blue-400" />
				{/if}
			</a>
		{/each}
	</nav>

	<div class="mt-auto border-t border-gray-50 p-4">
		<a
			href="/settings"
			class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
		>
			<Settings class="h-5 w-5 text-gray-400" />
			<span>Configurações</span>
		</a>
	</div>
</aside>
