// Dashboard constants
export const DASHBOARD_CONSTANTS = {
	NOTIFICATION_COUNT: 3,
	TITLE: "Dashboard do Supervisor",
	SUBTITLE: "Visão geral das turmas e plantões",
	LOADING_TEXT: "Carregando...",
	ERROR_SUBTITLE: "Erro ao carregar dados",
	LOADING_DATA_TEXT: "Carregando dados...",
	NO_SHIFTS_TEXT: "Nenhum plantão agendado para este dia",
	CLASS_PROGRESS_TITLE: "Progresso das Turmas - Aprovação de Documentos",
	CALENDAR_TITLE: "Calendário de Plantões",
	UPCOMING_SHIFTS_TITLE: "Próximos Plantões",
	CALENDAR_NAVIGATION_TITLE: "Navegação por Data",
} as const;

// Date constants
export const DATE_CONSTANTS = {
	INITIAL_DATE: "2024-01-16",
	DATE_OPTIONS: [
		{ date: "2024-01-16", label: "Hoje" },
		{ date: "2024-01-17", label: "Amanhã" },
		{ date: "2024-01-18", label: "18/01" },
	],
} as const;

// Calendar constants
export const CALENDAR_CONSTANTS = {
	WEEKDAYS: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
	CURRENT_YEAR: 2024,
	CURRENT_MONTH: 1,
	TODAY_DAY: 16,
	LEGEND_ITEMS: [
		{ color: "bg-blue-600", label: "Selecionado" },
		{ color: "bg-green-500", label: "Com plantões" },
		{ color: "bg-blue-100 border border-blue-300", label: "Hoje" },
	],
} as const;
