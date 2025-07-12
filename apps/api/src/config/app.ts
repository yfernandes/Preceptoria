// --- App Configuration ---
export const APP_CONFIG = {
	// Environment
	NODE_ENV: Bun.env.NODE_ENV ?? "development",

	// Server
	PORT: Bun.env.PORT ? Number(Bun.env.PORT) : 3000,

	// CORS
	CORS_ORIGINS: ["http://localhost:4123", "http://localhost:3000"] as string[],

	// Google Sheets
	GOOGLE_SPREADSHEET_ID: Bun.env.GOOGLE_SPREADSHEET_ID,

	// Cron Jobs
	CRON_PATTERNS: {
		GOOGLE_SHEETS_SYNC: "0 3 * * *", // Every day at 3am
	},
} as const;

// Type-safe config access
export type AppConfig = typeof APP_CONFIG;
