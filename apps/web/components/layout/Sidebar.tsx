"use client";

import { memo } from "react";
import {
	Home,
	BookOpen,
	Users,
	User,
	Calendar,
	FileText,
	Settings,
	GraduationCap,
} from "lucide-react";
import { SearchInput } from "../../components/ui/SearchInput";
import { SearchResults } from "../../components/ui/SearchResults";
import { useSearch } from "../../hooks/useSearch";
import type { MenuItem } from "../../types";

const MENU_ITEMS: MenuItem[] = [
	{ title: "Dashboard", icon: Home, href: "/dashboard", isActive: true },
	{ title: "Cursos", icon: BookOpen, href: "/cursos", isActive: false },
	{ title: "Turmas", icon: Users, href: "/turmas", isActive: false },
	{ title: "Alunos", icon: User, href: "/alunos", isActive: false },
	{ title: "Plantões", icon: Calendar, href: "/plantoes", isActive: false },
];

export const Sidebar = memo(() => {
	const { query, setQuery, results, hasResults } = useSearch();

	return (
		<div className="fixed top-0 left-0 z-40 flex h-screen w-80 flex-col border-r border-gray-200 bg-white">
			{/* Header */}
			<div className="flex-shrink-0 border-b border-gray-200 p-4">
				<div className="mb-4 flex items-center space-x-3">
					<div className="rounded-lg bg-blue-100 p-2">
						<GraduationCap className="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900">Preceptoria</h2>
						<p className="text-xs text-gray-600">Sistema de Gestão</p>
					</div>
				</div>

				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder="Buscar alunos, turmas, cursos..."
				/>

				{query && (
					<div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
						<SearchResults results={results} />
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="flex-1 overflow-y-auto p-4">
					{/* Main Navigation */}
					<div className="mb-8">
						<h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
							Navegação Principal
						</h3>
						<nav className="space-y-1">
							{MENU_ITEMS.map((item) => (
								<a
									key={item.title}
									href={item.href}
									className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
										item.isActive
											? "bg-blue-100 text-blue-700"
											: "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
									}`}
								>
									<item.icon className="h-5 w-5" />
									<span>{item.title}</span>
								</a>
							))}
						</nav>
					</div>

					{/* Quick Actions */}
					<div>
						<h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
							Ações Rápidas
						</h3>
						<nav className="space-y-1">
							<a
								href="/relatorios"
								className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
							>
								<FileText className="h-5 w-5" />
								<span>Relatórios</span>
							</a>
						</nav>
					</div>
				</div>

				{/* User Profile */}
				<div className="flex-shrink-0 border-t border-gray-200 p-4">
					<div className="flex items-center space-x-3 px-3 py-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							<User className="h-6 w-6 text-blue-600" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-gray-900">
								Prof. João Silva
							</p>
							<p className="truncate text-xs text-gray-600">Supervisor</p>
						</div>
						<button className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
							<Settings className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});

Sidebar.displayName = "Sidebar";
