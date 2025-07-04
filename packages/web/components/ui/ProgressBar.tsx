import { memo } from "react"
import { getProgressColor } from "@/utils/styleUtils"

interface ProgressBarProps {
  progress: number
  className?: string
}

export const ProgressBar = memo<ProgressBarProps>(({ progress, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div
        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
})

ProgressBar.displayName = "ProgressBar"
