import { Elysia } from "elysia";
import { cron } from "@elysiajs/cron";
import { APP_CONFIG } from "../config/app";
import { SyncService } from "@api/services";

const syncService = new SyncService();
/**
 * Applies cron jobs to the Elysia app
 */
export const cronMiddleware = new Elysia()
	.use(
		cron({
			name: "google-sheets-sync",
			pattern: APP_CONFIG.CRON_PATTERNS.GOOGLE_SHEETS_SYNC,
			run: async () => {
				console.log("[CRON] Starting Google Sheets sync...");
				try {
					const result = await syncService.syncFromGoogleSheets(
						APP_CONFIG.GOOGLE_SPREADSHEET_ID
					);
					console.log("[CRON] Google Sheets sync result:", result);
				} catch (error) {
					console.error("[CRON] Google Sheets sync failed:", error);
				}
			},
		})
	)
	.as("global");
