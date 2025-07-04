import { memo } from "react"
import { Button } from "@/components/ui/button"
import { DATE_CONSTANTS } from "@/constants/dashboard"

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export const DateSelector = memo<DateSelectorProps>(({ selectedDate, onDateChange }) => {
  return (
    <div className="mb-6">
      <div className="flex space-x-2 mb-4">
        {DATE_CONSTANTS.DATE_OPTIONS.map(({ date, label }) => (
          <Button
            key={date}
            variant={selectedDate === date ? "default" : "outline"}
            size="sm"
            onClick={() => onDateChange(date)}
            aria-label={`Selecionar ${label}`}
          >
            {label}({date.split("-")[2]}/01)
          </Button>
        ))}
      </div>
    </div>
  )
})

DateSelector.displayName = "DateSelector" 