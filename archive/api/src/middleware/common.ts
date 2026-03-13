import bearer from "@elysiajs/bearer"
import cors from "@elysiajs/cors"
import { opentelemetry } from "@elysiajs/opentelemetry"
import serverTiming from "@elysiajs/server-timing"
import { swagger } from "@elysiajs/swagger"
import { Elysia } from "elysia"
import { APP_CONFIG } from "../config/app"

/**
 * Applies all middleware to the Elysia app
 */
export const commonMiddlewares = new Elysia()
	// API Documentation
	.use(swagger())

	// Authentication
	.use(bearer())

	// CORS
	.use(
		cors({
			origin: APP_CONFIG.CORS_ORIGINS,
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		})
	)

	// Observability
	.use(opentelemetry())
	.use(serverTiming())
	.as("global")
