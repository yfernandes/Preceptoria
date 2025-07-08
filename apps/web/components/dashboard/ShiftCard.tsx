import { memo } from "react"
import { Clock, User, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ShiftData } from "@/types"

interface ShiftCardProps {
  shift: ShiftData
}

export const ShiftCard = memo<ShiftCardProps>(({ shift }) => {
  const { time, class: className, preceptor, students, location } = shift

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{time}</span>
        </div>
        <Badge variant="outline">{className}</Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-blue-500" />
          <span className="text-sm">
            <strong>Preceptor:</strong> {preceptor}
          </span>
        </div>

        <div className="flex items-start space-x-2">
          <Users className="h-4 w-4 text-green-500 mt-0.5" />
          <div className="text-sm">
            <strong>Alunos ({students.length}):</strong>
            <div className="mt-1 flex flex-wrap gap-1">
              {students.map((student, index) => (
                <Badge key={`${student}-${index}`} variant="secondary" className="text-xs">
                  {student}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <strong>Local:</strong> {location}
        </div>
      </div>
    </div>
  )
})

ShiftCard.displayName = "ShiftCard"
