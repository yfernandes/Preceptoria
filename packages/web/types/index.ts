import type React from "react"
export interface ClassData {
  id: number
  name: string
  course: string
  progress: number
  status: "Concluído" | "Em Andamento" | "Pendente Revisão" | "Início do Processo"
  studentsCount: number
  documentsApproved: number
  documentsTotal: number
  lastUpdate: string
  issues: number
}

export interface ShiftData {
  id: number
  date: string
  time: string
  class: string
  preceptor: string
  students: string[]
  location: string
}

export interface SearchResult {
  type: string
  name: string
  id: string
}

export interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  isActive: boolean
}

export interface DashboardStats {
  totalClasses: number
  completedClasses: number
  classesNeedingAttention: number
  todayShifts: number
}
