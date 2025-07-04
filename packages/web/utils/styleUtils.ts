import type { ClassData } from "@/types"

export const getStatusColor = (status: ClassData["status"]): string => {
  const statusColors = {
    Concluído: "bg-green-100 text-green-800 border-green-200",
    "Em Andamento": "bg-blue-100 text-blue-800 border-blue-200",
    "Pendente Revisão": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Início do Processo": "bg-gray-100 text-gray-800 border-gray-200",
  }
  return statusColors[status] || statusColors["Início do Processo"]
}

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return "bg-green-500"
  if (progress >= 50) return "bg-blue-500"
  if (progress >= 30) return "bg-yellow-500"
  return "bg-red-500"
}
