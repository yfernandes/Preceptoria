"use client";

import { usePathname } from "next/navigation";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import React from "react";
import { ModeToggle } from "@/components/mode-toggle";

// Map of routes to their display names
const routeNames: Record<string, string> = {
	courses: "Cursos",
	classes: "Turmas",
	students: "Estudantes",
	supervisors: "Supervisores",
	hospitals: "Hospitais",
	preceptors: "Preceptores",
	"hospital-managers": "Gerentes Hospitalares",
	shifts: "Turnos",
	documents: "Documentos",
	users: "Usuários",
	"org-admins": "Admins de Organização",
	settings: "Configurações",
};

// Map of parent routes to their display names
const parentRouteNames: Record<string, string> = {
	academic: "Gestão Acadêmica",
	hospital: "Gestão Hospitalar",
	internships: "Estágios",
	admin: "Administração",
};

function getBreadcrumbs(pathname: string) {
	const segments = pathname.split("/").filter(Boolean);
	const breadcrumbs = [];

	// Always add Dashboard as the first breadcrumb
	breadcrumbs.push({
		title: "Dashboard",
		href: "/dashboard",
		isCurrent: segments.length === 1,
	});

	// Add parent section if it exists
	if (segments.length > 1) {
		const parentRoute = segments[1];
		const parentName = parentRouteNames[parentRoute];

		if (parentName) {
			breadcrumbs.push({
				title: parentName,
				href: `/dashboard/${parentRoute}`,
				isCurrent: segments.length === 2,
			});
		}
	}

	// Add current page
	if (segments.length > 1) {
		const currentRoute = segments[segments.length - 1];
		const currentName = routeNames[currentRoute] || currentRoute;

		breadcrumbs.push({
			title: currentName,
			href: pathname,
			isCurrent: true,
		});
	}

	return breadcrumbs;
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const breadcrumbs = getBreadcrumbs(pathname);

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4 w-full justify-between">
						<div className="flex items-center gap-2">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-[orientation=vertical]:h-4"
							/>
							<Breadcrumb>
								<BreadcrumbList>
									{breadcrumbs.map((breadcrumb, index) => (
										<React.Fragment key={breadcrumb.href}>
											<BreadcrumbItem className="hidden md:block">
												{breadcrumb.isCurrent ? (
													<BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
												) : (
													<BreadcrumbLink href={breadcrumb.href}>
														{breadcrumb.title}
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>
											{index < breadcrumbs.length - 1 && (
												<BreadcrumbSeparator className="hidden md:block" />
											)}
										</React.Fragment>
									))}
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<ModeToggle />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
