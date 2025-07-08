"use client"

import { memo } from "react"
import { Home, BookOpen, Users, User, Calendar, FileText, Settings, GraduationCap } from "lucide-react"
import { SearchInput } from "@/components/ui/SearchInput"
import { SearchResults } from "@/components/ui/SearchResults"
import { useSearch } from "@/hooks/useSearch"
import type { MenuItem } from "@/types"

const MENU_ITEMS: MenuItem[] = [
  { title: "Dashboard", icon: Home, href: "/dashboard", isActive: true },
  { title: "Cursos", icon: BookOpen, href: "/cursos", isActive: false },
  { title: "Turmas", icon: Users, href: "/turmas", isActive: false },
  { title: "Alunos", icon: User, href: "/alunos", isActive: false },
  { title: "Plantões", icon: Calendar, href: "/plantoes", isActive: false },
]

export const Sidebar = memo(() => {
  const { query, setQuery, results, hasResults } = useSearch()

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Preceptoria</h2>
            <p className="text-xs text-gray-600">Sistema de Gestão</p>
          </div>
        </div>

        <SearchInput value={query} onChange={setQuery} placeholder="Buscar alunos, turmas, cursos..." />

        {query && (
          <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-y-auto">
            <SearchResults results={results} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Main Navigation */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navegação Principal</h3>
            <nav className="space-y-1">
              {MENU_ITEMS.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ações Rápidas</h3>
            <nav className="space-y-1">
              <a
                href="/relatorios"
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <FileText className="h-5 w-5" />
                <span>Relatórios</span>
              </a>
            </nav>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Prof. João Silva</p>
              <p className="text-xs text-gray-600 truncate">Supervisor</p>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

Sidebar.displayName = "Sidebar"
