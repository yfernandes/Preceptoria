import { Elysia } from "elysia";

// --- Controllers ---
import {
	adminController,
	authController,
	classesController,
	coursesController,
	hospitalController,
	hospitalManagerController,
	orgAdminController,
	preceptorController,
	schoolController,
	shiftController,
	studentsController,
	supervisorController,
	documentsController,
	userController,
	healthController,
} from "@api/controllers";

// --- Middleware ---
import {
	commomMidlewares,
	loggingMiddleware,
	errorHandlerMiddleware,
	cronMiddleware,
} from "./middleware";

// Create and configure the Elysia app
const app = new Elysia()
	// Apply all middleware and services
	.use(commomMidlewares)
	.use(loggingMiddleware)
	.use(errorHandlerMiddleware)
	.use(cronMiddleware)

	// Add controllers
	.use(healthController)
	.use(adminController)
	.use(authController)
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
	.use(documentsController)
	.use(userController);

// Export the app instance
export { app };
