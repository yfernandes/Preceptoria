"use client"

import { useState, useEffect, useMemo } from "react"
import type { ClassData, ShiftData, DashboardStats } from "@/types"
import { MOCK_CLASSES, MOCK_SHIFTS } from "@/constants/mockData"

export const useDashboardData = () => {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [shifts, setShifts] = useState<ShiftData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        setClasses(MOCK_CLASSES)
        setShifts(MOCK_SHIFTS)
      } catch (err) {
        setError("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats: DashboardStats = useMemo(
    () => ({
      totalClasses: classes.length,
      completedClasses: classes.filter((c) => c.status === "Concluído").length,
      classesNeedingAttention: classes.filter((c) => c.issues > 0).length,
      todayShifts: shifts.filter((s) => s.date === "2024-01-16").length,
    }),
    [classes, shifts],
  )

  const getShiftsByDate = (date: string) => {
    return shifts.filter((shift) => shift.date === date)
  }

  const getUpcomingShifts = (fromDate: string, limit = 3) => {
    return shifts.filter((shift) => shift.date > fromDate).slice(0, limit)
  }

  return {
    classes,
    shifts,
    stats,
    loading,
    error,
    getShiftsByDate,
    getUpcomingShifts,
  }
}
