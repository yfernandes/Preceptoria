"use client";

export default function DashboardPage() {
	const routes = [
		{ name: "Classes", path: "/classes" },
		{ name: "Documents", path: "/documents" },
		{ name: "Hospitals", path: "/hospitals" },
		{ name: "Students", path: "/students" },
		{ name: "Schools", path: "/schools" },
		{ name: "Courses", path: "/courses" },
		{ name: "Shifts", path: "/shifts" },
		{ name: "Supervisors", path: "/supervisors" },
		{ name: "Hospital Managers", path: "/hospitalManagers" },
		{ name: "Preceptors", path: "/preceptors" },
		{ name: "Users", path: "/users" },
		{ name: "Audit", path: "/audit" },
		{ name: "Org Admin", path: "/orgAdmin" },
	];

	return (
		<div className="p-8">
			<h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{routes.map((route) => (
					<a
						key={route.path}
						href={route.path}
						className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
					>
						<h2 className="text-lg font-semibold text-gray-900">
							{route.name}
						</h2>
						<p className="text-sm text-gray-600">
							View {route.name.toLowerCase()}
						</p>
					</a>
				))}
			</div>
		</div>
	);
}
