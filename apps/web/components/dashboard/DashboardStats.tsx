import { memo } from "react"
import { Users, CheckCircle, AlertTriangle, Calendar } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import type { DashboardStats as StatsType } from "@/types"

interface DashboardStatsProps {
  stats: StatsType
}

export const DashboardStats = memo<DashboardStatsProps>(({ stats }) => {
  const statCards = [
    {
      title: "Total de Turmas",
      value: stats.totalClasses,
      icon: Users,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Turmas Concluídas",
      value: stats.completedClasses,
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100",
    },
    {
      title: "Requer Atenção",
      value: stats.classesNeedingAttention,
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      iconBgColor: "bg-yellow-100",
    },
    {
      title: "Plantões Hoje",
      value: stats.todayShifts,
      icon: Calendar,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
})

DashboardStats.displayName = "DashboardStats"
