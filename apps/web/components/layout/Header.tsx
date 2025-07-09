import { memo } from "react";
import { Bell } from "lucide-react";

interface HeaderProps {
	title: string;
	subtitle: string;
	notificationCount?: number;
}

export const Header = memo<HeaderProps>(
	({ title, subtitle, notificationCount = 0 }) => {
		return (
			<header className="border-b bg-white shadow-sm">
				<div className="px-6 lg:px-8">
					<div className="flex items-center justify-between py-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">{title}</h1>
							<p className="text-sm text-gray-600">{subtitle}</p>
						</div>

						<div className="relative">
							<button className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
								<Bell className="h-6 w-6" />
								{notificationCount > 0 && (
									<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
										{notificationCount}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>
			</header>
		);
	}
);

Header.displayName = "Header";
