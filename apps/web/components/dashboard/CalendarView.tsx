import { memo } from "react"
import { generateCalendarDays, formatDateString } from "@/utils/dateUtils"
import { CALENDAR_CONSTANTS, DASHBOARD_CONSTANTS } from "@/constants/dashboard"
import type { ShiftData } from "@/types"

interface CalendarViewProps {
  selectedDate: string
  onDateChange: (date: string) => void
  getShiftsByDate: (date: string) => ShiftData[]
}

export const CalendarView = memo<CalendarViewProps>(({ selectedDate, onDateChange, getShiftsByDate }) => {
  const calendarDays = generateCalendarDays(CALENDAR_CONSTANTS.CURRENT_YEAR, CALENDAR_CONSTANTS.CURRENT_MONTH)

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="font-semibold text-gray-900 mb-4">{DASHBOARD_CONSTANTS.CALENDAR_NAVIGATION_TITLE}</h3>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {CALENDAR_CONSTANTS.WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateStr = formatDateString(CALENDAR_CONSTANTS.CURRENT_YEAR, CALENDAR_CONSTANTS.CURRENT_MONTH, day)
            const hasShift = getShiftsByDate(dateStr).length > 0
            const isSelected = selectedDate === dateStr
            const isToday = day === CALENDAR_CONSTANTS.TODAY_DAY

            return (
              <button
                key={day}
                onClick={() => onDateChange(dateStr)}
                className={`
                  h-8 w-8 text-sm rounded-md transition-colors relative
                  ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : hasShift
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "text-gray-700 hover:bg-gray-100"
                  }
                `}
                aria-label={`Selecionar ${dateStr}`}
              >
                {day}
                {hasShift && !isSelected && (
                  <div className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 bg-green-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {CALENDAR_CONSTANTS.LEGEND_ITEMS.map(({ color, label }) => (
              <div key={label} className="flex items-center space-x-1">
                <div className={`h-2 w-2 ${color} rounded-full`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

CalendarView.displayName = "CalendarView" 