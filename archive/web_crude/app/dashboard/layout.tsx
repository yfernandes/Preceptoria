"use client";

import React from "react";
import Link from "next/link";

const resources = [
	{ name: "Classes", path: "/dashboard/classes" },
	{ name: "Documents", path: "/dashboard/documents" },
	{ name: "Hospitals", path: "/dashboard/hospitals" },
	{ name: "Students", path: "/dashboard/students" },
	{ name: "Schools", path: "/dashboard/schools" },
	{ name: "Courses", path: "/dashboard/courses" },
	{ name: "Shifts", path: "/dashboard/shifts" },
	{ name: "Supervisors", path: "/dashboard/supervisors" },
	{ name: "Hospital Managers", path: "/dashboard/hospitalManagers" },
	{ name: "Preceptors", path: "/dashboard/preceptors" },
	{ name: "Users", path: "/dashboard/users" },
	{ name: "Audit", path: "/dashboard/audit" },
	{ name: "Org Admin", path: "/dashboard/orgAdmin" },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col">
			{/* Fixed Header */}
			<header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-20 flex items-center px-6 shadow-sm">
				<h1 className="text-2xl font-bold">Dashboard</h1>
			</header>
			<div className="flex flex-1 pt-16">
				{/* Sidebar */}
				<aside className="w-64 bg-gray-50 border-r border-gray-200 h-[calc(100vh-4rem)] fixed top-16 left-0 flex flex-col z-10">
					<nav className="flex flex-col h-full p-4 gap-2">
						<Link
							href="/dashboard/home"
							className="text-blue-600 font-semibold hover:text-blue-800 mb-2"
						>
							Home
						</Link>
						<hr className="my-2 border-gray-300" />
						{resources.map((r) => (
							<Link
								key={r.path}
								href={r.path}
								className="text-gray-700 hover:text-blue-600 py-1 px-2 rounded hover:bg-blue-50"
							>
								{r.name}
							</Link>
						))}
					</nav>
				</aside>
				{/* Main Content */}
				<main className="flex-1 ml-64 p-8 bg-white min-h-[calc(100vh-4rem)]">
					{children}
				</main>
			</div>
		</div>
	);
}
