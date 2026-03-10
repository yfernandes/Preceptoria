#!/usr/bin/env bun

import { SyncService } from "@api/services/syncService";

// Environment validation
const requiredEnvVars = ["GOOGLE_SPREADSHEET_ID"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !Bun.env[envVar]);

if (missingEnvVars.length > 0) {
	console.error("❌ Missing required environment variables:", missingEnvVars);
	console.error(
		"Please check your .env file and ensure all required variables are set."
	);
	process.exit(1);
}

async function main() {
	try {
		console.log("🔄 Starting manual Google Sheets sync...");

		const syncService = new SyncService();
		const spreadsheetId = Bun.env.GOOGLE_SPREADSHEET_ID;

		const result = await syncService.syncFromGoogleSheets(spreadsheetId);

		if (result.success) {
			console.log("✅ Sync completed successfully!");
			console.log(
				`📊 Stats: ${result.stats.newStudents.toString()} new students, ${result.stats.newDocuments.toString()} new documents`
			);
		} else {
			console.log("❌ Sync completed with errors:", result.message);
			if (result.stats.errors.length > 0) {
				console.log("Errors:", result.stats.errors);
			}
		}

		process.exit(result.success ? 0 : 1);
	} catch (error) {
		console.error("💥 Sync failed:", error);
		process.exit(1);
	}
}

await main();
