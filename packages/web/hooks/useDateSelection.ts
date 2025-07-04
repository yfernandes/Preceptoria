import { useState, useCallback } from "react"
import { DATE_CONSTANTS } from "@/constants/dashboard"

export const useDateSelection = (initialDate = DATE_CONSTANTS.INITIAL_DATE) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate)

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  return {
    selectedDate,
    handleDateChange,
  }
} 