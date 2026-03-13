<script lang="ts">
import {
	Building2,
	Calendar,
	Clock,
	Files,
	GraduationCap,
	Hospital,
	Layers,
	LayoutDashboard,
	Link,
	User,
	Users,
} from "lucide-svelte"
import { page } from "$app/state"

const _navItems = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Hospitais", href: "/hospitals", icon: Hospital },
	{ name: "Preceptores", href: "/preceptors", icon: User },
	{ name: "Escolas", href: "/schools", icon: GraduationCap },
	{ name: "Turmas", href: "/classes", icon: Layers },
	{ name: "Organizações", href: "/organizations", icon: Building2 },
	{ name: "Estudantes", href: "/students", icon: Users },
	{ name: "Vínculos", href: "/placements", icon: Link },
	{ name: "Documentos", href: "/documents", icon: Files },
	{ name: "Disponibilidade", href: "/availability", icon: Clock },
	{ name: "Plantões", href: "/shifts", icon: Calendar },
]

const _isActive = (href: string) => {
	if (href === "/dashboard") return page.url.pathname === "/dashboard"
	return page.url.pathname.startsWith(href)
}
</script>

<aside
	class="flex h-full w-72 flex-col border-r border-gray-100 bg-white shadow-xl shadow-gray-900/5 transition-all duration-300"
>
	<div class="flex h-20 items-center gap-3 px-8">
		<div
			class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-200"
		>
			<Building2 class="h-6 w-6 text-white" />
		</div>
		<span class="text-xl font-black tracking-tight text-gray-900 uppercase">Preceptoria</span>
	</div>

	<nav class="flex-1 space-y-1.5 px-4 py-6">
		{#each navItems as item (item.href)}
			<a
				href={resolve(item.href)}
				class={cn(
					"group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
					isActive(item.href)
						? "bg-blue-50 text-blue-600 shadow-sm"
						: "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
				)}
			>
				<div class="flex items-center gap-3">
					<item.icon
						class={cn(
							"h-5 w-5 transition-colors",
							isActive(item.href) ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
						)}
					/>
					<span>{item.name}</span>
				</div>
				{#if isActive(item.href)}
					<ChevronRight class="animate-in slide-in-from-left-2 h-4 w-4" />
				{/if}
			</a>
		{/each}
	</nav>

	<div class="mt-auto border-t border-gray-50 p-4">
		<a
			href={resolve("/settings")}
			class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
		>
			<Settings class="h-5 w-5 text-gray-400" />
			<span>Configurações</span>
		</a>
	</div>
</aside>
