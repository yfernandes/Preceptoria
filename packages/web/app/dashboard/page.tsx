"use client"

import { useMemo, useCallback } from "react"
import { FileCheck, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { ClassProgressCard } from "@/components/dashboard/ClassProgressCard"
import { ShiftCard } from "@/components/dashboard/ShiftCard"
import { DateSelector } from "@/components/dashboard/DateSelector"
import { CalendarView } from "@/components/dashboard/CalendarView"
import { UpcomingShifts } from "@/components/dashboard/UpcomingShifts"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useDateSelection } from "@/hooks/useDateSelection"
import { formatDateWithWeekday } from "@/utils/dateUtils"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { DASHBOARD_CONSTANTS } from "@/constants/dashboard"
import type { ClassData, ShiftData } from "@/types"

export default function SupervisorDashboard() {
  const { selectedDate, handleDateChange } = useDateSelection()
  const { classes, stats, loading, error, getShiftsByDate, getUpcomingShifts } = useDashboardData()

  // Memoized computed values
  const todayShifts = useMemo(() => getShiftsByDate(selectedDate), [selectedDate, getShiftsByDate])
  const upcomingShifts = useMemo(() => getUpcomingShifts(selectedDate), [selectedDate, getUpcomingShifts])

  // Callback handlers
  const handleViewClassDetails = useCallback((classId: number) => {
    // Navigate to class details page
    console.log("Navigate to class details:", classId)
  }, [])

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title={DASHBOARD_CONSTANTS.TITLE} subtitle={DASHBOARD_CONSTANTS.LOADING_TEXT} notificationCount={DASHBOARD_CONSTANTS.NOTIFICATION_COUNT}>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text={DASHBOARD_CONSTANTS.LOADING_DATA_TEXT} />
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title={DASHBOARD_CONSTANTS.TITLE} subtitle={DASHBOARD_CONSTANTS.ERROR_SUBTITLE} notificationCount={DASHBOARD_CONSTANTS.NOTIFICATION_COUNT}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ErrorBoundary>
      <DashboardLayout title={DASHBOARD_CONSTANTS.TITLE} subtitle={DASHBOARD_CONSTANTS.SUBTITLE} notificationCount={DASHBOARD_CONSTANTS.NOTIFICATION_COUNT}>
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
          <DashboardStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Class Progress Section */}
            <ClassProgressSection classes={classes} onViewDetails={handleViewClassDetails} />

            {/* Shifts Calendar Section */}
            <ShiftsCalendarSection
              selectedDate={selectedDate}
              todayShifts={todayShifts}
              upcomingShifts={upcomingShifts}
              onDateChange={handleDateChange}
              getShiftsByDate={getShiftsByDate}
            />
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  )
}

// Layout component for consistent dashboard structure
interface DashboardLayoutProps {
  title: string
  subtitle: string
  notificationCount: number
  children: React.ReactNode
}

function DashboardLayout({ title, subtitle, notificationCount, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-80">
        <Header title={title} subtitle={subtitle} notificationCount={notificationCount} />
        {children}
      </div>
    </div>
  )
}

// Class Progress Section Component
interface ClassProgressSectionProps {
  classes: ClassData[]
  onViewDetails: (classId: number) => void
}

function ClassProgressSection({ classes, onViewDetails }: ClassProgressSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileCheck className="h-5 w-5 text-blue-600" />
          <span>{DASHBOARD_CONSTANTS.CLASS_PROGRESS_TITLE}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {classes.map((classItem) => (
          <ClassProgressCard 
            key={classItem.id} 
            classData={classItem} 
            onViewDetails={onViewDetails} 
          />
        ))}
      </CardContent>
    </Card>
  )
}

// Shifts Calendar Section Component
interface ShiftsCalendarSectionProps {
  selectedDate: string
  todayShifts: ShiftData[]
  upcomingShifts: ShiftData[]
  onDateChange: (date: string) => void
  getShiftsByDate: (date: string) => ShiftData[]
}

function ShiftsCalendarSection({ 
  selectedDate, 
  todayShifts, 
  upcomingShifts, 
  onDateChange, 
  getShiftsByDate 
}: ShiftsCalendarSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          <span>{DASHBOARD_CONSTANTS.CALENDAR_TITLE}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />

        {/* Selected Date Shifts */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Plantões - {formatDateWithWeekday(selectedDate)}
          </h3>

          {todayShifts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {DASHBOARD_CONSTANTS.NO_SHIFTS_TEXT}
            </p>
          ) : (
            todayShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} />)
          )}
        </div>

        {/* Upcoming Shifts */}
        {upcomingShifts.length > 0 && (
          <UpcomingShifts shifts={upcomingShifts} />
        )}

        {/* Full Calendar */}
        <CalendarView 
          selectedDate={selectedDate} 
          onDateChange={onDateChange} 
          getShiftsByDate={getShiftsByDate} 
        />
      </CardContent>
    </Card>
  )
}
