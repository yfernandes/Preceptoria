import { memo } from "react"
import { Bell } from "lucide-react"

interface HeaderProps {
  title: string
  subtitle: string
  notificationCount?: number
}

export const Header = memo<HeaderProps>(({ title, subtitle, notificationCount = 0 }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>

          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-6 w-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
})

Header.displayName = "Header"
