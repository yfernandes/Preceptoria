// --- Core Imports ---
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import bearer from "@elysiajs/bearer";
import cors from "@elysiajs/cors";
import { opentelemetry } from "@elysiajs/opentelemetry";
import serverTiming from "@elysiajs/server-timing";
import { cron } from "@elysiajs/cron";
import { RequestContext, Utils, wrap } from "@mikro-orm/core";

// // --- App Services ---
import { SyncService } from "./services/syncService";
import { db } from "./db";

// // --- Controllers ---
import {
	adminController,
	authController,
	classesController,
	coursesController,
	documentsController,
	hospitalController,
	hospitalManagerController,
	orgAdminController,
	preceptorController,
	schoolController,
	shiftController,
	studentsController,
	supervisorController,
	userController,
} from "./controllers";
import { treaty } from "@elysiajs/eden";

// --- App Setup ---
const SPREADSHEET_ID = Bun.env.GOOGLE_SPREADSHEET_ID;
const syncService = new SyncService();

export const app = new Elysia()
	// --- Middleware ---
	.use(swagger())
	.use(bearer())
	.use(cors())
	.use(opentelemetry())
	.use(serverTiming())
	.use(
		cron({
			name: "google-sheets-sync",
			pattern: "0 3 * * *", // Every day at 3am
			run: async () => {
				console.log("[CRON] Starting Google Sheets sync...");
				const result = await syncService.syncFromGoogleSheets(SPREADSHEET_ID);
				console.log("[CRON] Google Sheets sync result:", result);
			},
		})
	)
	// // --- Request/Response Logging ---
	.on("beforeHandle", () => {
		RequestContext.enter(db.em);
	})
	.on("beforeHandle", ({ request }) => {
		console.log(
			`📥 ${new Date().toISOString()} - ${request.method} ${request.url}`
		);
	})
	.on("afterHandle", ({ response }) =>
		Utils.isEntity(response) ? wrap(response).toObject() : response
	)
	.on("afterHandle", ({ request, set }) => {
		const statusCode = set.status || 200;
		const statusEmoji = statusCode >= 400 ? "❌" : "✅";
		console.log(
			`${statusEmoji} ${new Date().toISOString()} - ${request.method} ${request.url} - ${statusCode}`
		);
	})
	// // --- Global Error Handler ---
	.on("error", ({ error, set }) => {
		console.error("Global error handler:", error);
		if (error instanceof Error) {
			if (
				error.message.includes("duplicate key") ||
				error.message.includes("unique constraint")
			) {
				set.status = 409;
				return {
					success: false,
					message: "Resource already exists",
					error: "CONFLICT",
				};
			}
			if (
				error.message.includes("validation") ||
				error.message.includes("ValidationError")
			) {
				set.status = 400;
				return {
					success: false,
					message: "Validation failed",
					error: "VALIDATION_ERROR",
				};
			}
			if (
				error.message.includes("Authentication failed") ||
				error.message.includes("Unauthorized")
			) {
				set.status = 401;
				return {
					success: false,
					message: "Authentication failed",
					error: "UNAUTHORIZED",
				};
			}
			if (
				error.message.includes("permission") ||
				error.message.includes("Access denied")
			) {
				set.status = 403;
				return {
					success: false,
					message: "Access denied",
					error: "FORBIDDEN",
				};
			}
			if (
				error.message.includes("not found") ||
				error.message.includes("Not Found")
			) {
				set.status = 404;
				return {
					success: false,
					message: "Resource not found",
					error: "NOT_FOUND",
				};
			}
		}
		set.status = 500;
		return {
			success: false,
			message: "Internal server error",
			error: "INTERNAL_ERROR",
		};
	})
	// // --- Health Check ---
	.get("/health", () => ({
		status: "ok",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: Bun.env.NODE_ENV || "development",
	}))
	// // --- Controllers ---
	.use(authController)
	.use(adminController)
	.use(classesController)
	.use(coursesController)
	.use(hospitalController)
	.use(hospitalManagerController)
	.use(orgAdminController)
	.use(preceptorController)
	.use(schoolController)
	.use(shiftController)
	.use(studentsController)
	.use(supervisorController);
// .use(userController);
// .use(documentsController)

// Export the app type for Eden Treaty
export type App = typeof app;
