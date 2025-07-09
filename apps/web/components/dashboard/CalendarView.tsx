import { memo } from "react";
import { generateCalendarDays, formatDateString } from "../../utils/dateUtils";
import {
	CALENDAR_CONSTANTS,
	DASHBOARD_CONSTANTS,
} from "../../constants/dashboard";
import type { ShiftData } from "../../types";

interface CalendarViewProps {
	selectedDate: string;
	onDateChange: (date: string) => void;
	getShiftsByDate: (date: string) => ShiftData[];
}

export const CalendarView = memo<CalendarViewProps>(
	({ selectedDate, onDateChange, getShiftsByDate }) => {
		const calendarDays = generateCalendarDays(
			CALENDAR_CONSTANTS.CURRENT_YEAR,
			CALENDAR_CONSTANTS.CURRENT_MONTH
		);

		return (
			<div className="mt-6 border-t pt-6">
				<h3 className="mb-4 font-semibold text-gray-900">
					{DASHBOARD_CONSTANTS.CALENDAR_NAVIGATION_TITLE}
				</h3>
				<div className="rounded-lg border border-gray-200 bg-white p-4">
					{/* Weekday headers */}
					<div className="mb-2 grid grid-cols-7 gap-1">
						{CALENDAR_CONSTANTS.WEEKDAYS.map((day) => (
							<div
								key={day}
								className="py-2 text-center text-xs font-medium text-gray-500"
							>
								{day}
							</div>
						))}
					</div>

					{/* Calendar grid */}
					<div className="grid grid-cols-7 gap-1">
						{calendarDays.map((day) => {
							const dateStr = formatDateString(
								CALENDAR_CONSTANTS.CURRENT_YEAR,
								CALENDAR_CONSTANTS.CURRENT_MONTH,
								day
							);
							const hasShift = getShiftsByDate(dateStr).length > 0;
							const isSelected = selectedDate === dateStr;
							const isToday = day === CALENDAR_CONSTANTS.TODAY_DAY;

							return (
								<button
									key={day}
									onClick={() => onDateChange(dateStr)}
									className={`relative h-8 w-8 rounded-md text-sm transition-colors ${
										isSelected
											? "bg-blue-600 text-white"
											: isToday
												? "bg-blue-100 font-medium text-blue-700"
												: hasShift
													? "bg-green-100 text-green-700 hover:bg-green-200"
													: "text-gray-700 hover:bg-gray-100"
									} `}
									aria-label={`Selecionar ${dateStr}`}
								>
									{day}
									{hasShift && !isSelected && (
										<div className="absolute right-0.5 bottom-0.5 h-1.5 w-1.5 rounded-full bg-green-500" />
									)}
								</button>
							);
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
		);
	}
);

CalendarView.displayName = "CalendarView";
