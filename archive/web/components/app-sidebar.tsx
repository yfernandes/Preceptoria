"use client";

import * as React from "react";
import {
	GraduationCap,
	Building2,
	Calendar,
	FileText,
	Settings2,
	Home,
	BookOpen,
	ClipboardList,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

// Preceptoria data structure
const data = {
	user: {
		name: "Usuário",
		email: "usuario@preceptoria.com",
		avatar: "/avatars/default.jpg",
	},
	teams: [
		{
			name: "Preceptoria",
			logo: GraduationCap,
			plan: "Sistema de Gestão",
		},
	],
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: Home,
			isActive: true,
			items: [
				{
					title: "Visão Geral",
					url: "/dashboard",
				},
				{
					title: "Relatórios",
					url: "/dashboard/reports",
				},
			],
		},
		{
			title: "Gestão Acadêmica",
			url: "/dashboard/academic",
			icon: BookOpen,
			items: [
				{
					title: "Cursos",
					url: "/dashboard/courses",
				},
				{
					title: "Turmas",
					url: "/dashboard/classes",
				},
				{
					title: "Estudantes",
					url: "/dashboard/students",
				},
				{
					title: "Supervisores",
					url: "/dashboard/supervisors",
				},
			],
		},
		{
			title: "Gestão Hospitalar",
			url: "/dashboard/hospital",
			icon: Building2,
			items: [
				{
					title: "Hospitais",
					url: "/dashboard/hospitals",
				},
				{
					title: "Preceptores",
					url: "/dashboard/preceptors",
				},
				{
					title: "Gerentes Hospitalares",
					url: "/dashboard/hospital-managers",
				},
			],
		},
		{
			title: "Estágios",
			url: "/dashboard/internships",
			icon: Calendar,
			items: [
				{
					title: "Turnos",
					url: "/dashboard/shifts",
				},
				{
					title: "Agendamento",
					url: "/dashboard/scheduling",
				},
				{
					title: "Calendário",
					url: "/dashboard/calendar",
				},
			],
		},
		{
			title: "Documentos",
			url: "/dashboard/documents",
			icon: FileText,
			items: [
				{
					title: "Gestão de Documentos",
					url: "/dashboard/documents",
				},
				{
					title: "Validação",
					url: "/dashboard/documents/validation",
				},
				{
					title: "Relatórios",
					url: "/dashboard/documents/reports",
				},
			],
		},
		{
			title: "Administração",
			url: "/dashboard/admin",
			icon: Settings2,
			items: [
				{
					title: "Usuários",
					url: "/dashboard/users",
				},
				{
					title: "Admins de Organização",
					url: "/dashboard/org-admins",
				},
				{
					title: "Configurações",
					url: "/dashboard/settings",
				},
			],
		},
	],
	projects: [
		{
			name: "Estágios Ativos",
			url: "/dashboard/shifts/active",
			icon: Calendar,
		},
		{
			name: "Documentos Pendentes",
			url: "/dashboard/documents/pending",
			icon: FileText,
		},
		{
			name: "Relatórios",
			url: "/dashboard/reports",
			icon: ClipboardList,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavProjects projects={data.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
