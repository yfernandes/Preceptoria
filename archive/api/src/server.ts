// --- Controllers ---
import {
	adminController,
	authController,
	classesController,
	coursesController,
	documentsController,
	healthController,
	hospitalController,
	hospitalManagerController,
	orgAdminController,
	preceptorController,
	schoolController,
	shiftController,
	studentsController,
	supervisorController,
	userController,
} from "@api/modules/controllers"
import { Elysia } from "elysia"

// --- Middleware ---
import {
	commonMiddlewares,
	cronMiddleware,
	errorHandlerMiddleware,
	loggingMiddleware,
} from "./middleware"

// Create and configure the Elysia app
const app = new Elysia()
	// Apply all middleware and services
	.use(commonMiddlewares)
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
	.use(userController)

// Export the app instance
export { app }
