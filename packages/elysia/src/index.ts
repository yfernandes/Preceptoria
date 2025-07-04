import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import bearer from "@elysiajs/bearer";
import cors from "@elysiajs/cors";
import { opentelemetry } from "@elysiajs/opentelemetry";
import serverTiming from "@elysiajs/server-timing";
import { cron } from "@elysiajs/cron";
import { SyncService } from "./services/syncService";
// import cron from "@elysiajs/cron";
import { RequestContext, Utils, wrap } from "@mikro-orm/core";

import { adminController } from "./controllers/admin.controller";
import { authController } from "./controllers/auth.controller";
import { classesController } from "./controllers/classes.controller";
import { coursesController } from "./controllers/courses.controller";
import { documentsController } from "./controllers/documents.controller";
import { hospitalController } from "./controllers/hospital.controller";
import { hospitalManagerController } from "./controllers/hospitalManager.controller";
import { orgAdminController } from "./controllers/orgAdmin.controller";
import { preceptorController } from "./controllers/preceptor.controller";
import { schoolController } from "./controllers/school.controller";
import { shiftController } from "./controllers/shift.controller";
import { studentsController } from "./controllers/students.controller";
import { supervisorController } from "./controllers/supervisor.controller";
import { userController } from "./controllers/user.controller";
import { initORM } from "./db";

export const db = await initORM();

const SPREADSHEET_ID = "1gc4rKU34e6KHl34NgpAt-0uZD0gDmEEnOm2-1-o2gt0";

const syncService = new SyncService();

try {
	const app = new Elysia()
		.use(swagger())
		.use(bearer())
		.use(cors())
		.use(opentelemetry())
		.use(serverTiming())
		.use(cron({
			name: "google-sheets-sync",
			pattern: "0 3 * * *", // Every day at 3am
			run: async () => {
				console.log("[CRON] Starting Google Sheets sync...");
				const result = await syncService.syncFromGoogleSheets(SPREADSHEET_ID);
				console.log("[CRON] Google Sheets sync result:", result);
			}
		}))
		.on("beforeHandle", () => {
			RequestContext.enter(db.em);
		})
		.on("afterHandle", ({ response }) =>
			Utils.isEntity(response) ? wrap(response).toObject() : response
		)
		.use(authController)
		.use(adminController)
		.use(documentsController)
		.use(classesController)
		.use(coursesController)
		.use(hospitalController)
		.use(hospitalManagerController)
		.use(orgAdminController)
		.use(preceptorController)
		.use(schoolController)
		.use(shiftController)
		.use(studentsController)
		.use(supervisorController)
		.use(userController)
		.listen(3000);

	if (app.server) {
		console.log(
			`🦊 Elysia is running at ${app.server.hostname}:${app.server.port?.toString() || '3000'}`
		);
	}
} catch (error) {
	console.error(error);
}
