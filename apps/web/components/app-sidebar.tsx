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
			url: "/academic",
			icon: BookOpen,
			items: [
				{
					title: "Cursos",
					url: "/courses",
				},
				{
					title: "Turmas",
					url: "/classes",
				},
				{
					title: "Estudantes",
					url: "/students",
				},
				{
					title: "Supervisores",
					url: "/supervisors",
				},
			],
		},
		{
			title: "Gestão Hospitalar",
			url: "/hospital",
			icon: Building2,
			items: [
				{
					title: "Hospitais",
					url: "/hospitals",
				},
				{
					title: "Preceptores",
					url: "/preceptors",
				},
				{
					title: "Gerentes Hospitalares",
					url: "/hospital-managers",
				},
			],
		},
		{
			title: "Estágios",
			url: "/internships",
			icon: Calendar,
			items: [
				{
					title: "Turnos",
					url: "/shifts",
				},
				{
					title: "Agendamento",
					url: "/scheduling",
				},
				{
					title: "Calendário",
					url: "/calendar",
				},
			],
		},
		{
			title: "Documentos",
			url: "/documents",
			icon: FileText,
			items: [
				{
					title: "Gestão de Documentos",
					url: "/documents",
				},
				{
					title: "Validação",
					url: "/documents/validation",
				},
				{
					title: "Relatórios",
					url: "/documents/reports",
				},
			],
		},
		{
			title: "Administração",
			url: "/admin",
			icon: Settings2,
			items: [
				{
					title: "Usuários",
					url: "/users",
				},
				{
					title: "Admins de Organização",
					url: "/org-admins",
				},
				{
					title: "Configurações",
					url: "/settings",
				},
			],
		},
	],
	projects: [
		{
			name: "Estágios Ativos",
			url: "/shifts/active",
			icon: Calendar,
		},
		{
			name: "Documentos Pendentes",
			url: "/documents/pending",
			icon: FileText,
		},
		{
			name: "Relatórios",
			url: "/reports",
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
