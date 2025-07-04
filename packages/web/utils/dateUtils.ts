export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

export const formatDateWithWeekday = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export const generateCalendarDays = (year: number, month: number): number[] => {
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
}

export const formatDateString = (year: number, month: number, day: number): string => {
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}
