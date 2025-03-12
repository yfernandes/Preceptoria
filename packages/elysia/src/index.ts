import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import bearer from "@elysiajs/bearer";
import cors from "@elysiajs/cors";
import { opentelemetry } from "@elysiajs/opentelemetry";
import serverTiming from "@elysiajs/server-timing";
// import cron from "@elysiajs/cron";
import { RequestContext, Utils, wrap } from "@mikro-orm/core";

import { adminController } from "./controllers/admin.controller";
import { authController } from "./controllers/auth.controller";
import { classesController } from "./controllers/classes.controller";
import { courseController } from "./controllers/courses.controller";
import { documentsController } from "./controllers/documents.controller";
import { hospitalController } from "./controllers/hospital.controller";
import { hospitalManagerController } from "./controllers/hospitalManager.controller";
import { preceptorController } from "./controllers/preceptor.controller";
import { schoolController } from "./controllers/school.controller";
import { shiftsController } from "./controllers/shift.controller";
import { studentsController } from "./controllers/students.controller";
import { supervisorsController } from "./controllers/supervisor.controller";
import { usersController } from "./controllers/user.controller";
import { initORM } from "./db";

export const db = await initORM();
try {
	const app = new Elysia()
		.use(swagger())
		.use(bearer())
		.use(cors())
		// .use(cron()) // Will be used to sync old GSheets based form responses into the new system
		.use(cors())
		.use(opentelemetry())
		.use(serverTiming())
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
		.use(courseController)
		.use(hospitalController)
		.use(hospitalManagerController)
		.use(preceptorController)
		.use(schoolController)
		.use(shiftsController)
		.use(studentsController)
		.use(supervisorsController)
		.use(usersController)
		.listen(3000);

	if (app.server) {
		console.log(
			`🦊 Elysia is running at ${app.server.hostname}:${app.server.port.toString()}`
		);
	}
} catch (error) {
	console.error(error);
}
