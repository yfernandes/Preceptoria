"use client";

import { Button } from "@web/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";

export default function DashboardPage() {
	return (
		<div className="flex flex-col items-center justify-center h-full p-8">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Welcome to Preceptoria</CardTitle>
					<CardDescription>
						Your comprehensive dashboard for managing educational resources
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Select a resource from the sidebar to get started with managing your
						data.
					</p>
					<div className="flex gap-2">
						<Button variant="default">Get Started</Button>
						<Button variant="outline">View Documentation</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
