import { memo } from "react"
import { formatDateWithWeekday } from "@/utils/dateUtils"
import { DASHBOARD_CONSTANTS } from "@/constants/dashboard"
import type { ShiftData } from "@/types"

interface UpcomingShiftsProps {
  shifts: ShiftData[]
}

export const UpcomingShifts = memo<UpcomingShiftsProps>(({ shifts }) => {
  if (shifts.length === 0) return null

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="font-semibold text-gray-900 mb-3">{DASHBOARD_CONSTANTS.UPCOMING_SHIFTS_TITLE}</h3>
      <div className="space-y-3">
        {shifts.map((shift) => (
          <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-sm">
                {formatDateWithWeekday(shift.date)} - {shift.time}
              </div>
              <div className="text-xs text-gray-600">{shift.class}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{shift.preceptor}</div>
              <div className="text-xs text-gray-600">{shift.students.length} alunos</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

UpcomingShifts.displayName = "UpcomingShifts" 