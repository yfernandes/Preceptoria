import { memo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
	title: string;
	value: number;
	icon: LucideIcon;
	iconColor: string;
	iconBgColor: string;
}

export const StatCard = memo<StatCardProps>(
	({ title, value, icon: Icon, iconColor, iconBgColor }) => {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center">
						<div className={`p-2 ${iconBgColor} rounded-lg`}>
							<Icon className={`h-6 w-6 ${iconColor}`} />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">{title}</p>
							<p className="text-2xl font-bold text-gray-900">{value}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}
);

StatCard.displayName = "StatCard";
