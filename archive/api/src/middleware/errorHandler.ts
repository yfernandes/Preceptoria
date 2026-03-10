import { Elysia } from "elysia";

/**
 * Error response interface
 */
interface ErrorResponse {
	success: false;
	message: string;
	error: string;
}

/**
 * Applies global error handling middleware to the Elysia app
 */
export const errorHandlerMiddleware = new Elysia()
	.on("error", ({ error, set }): ErrorResponse => {
		console.error("Global error handler:", error);

		if (error instanceof Error) {
			// Database constraint violations
			if (
				error.message.includes("duplicate key") ||
				error.message.includes("unique constraint")
			) {
				(set as { status?: number }).status = 409;
				return {
					success: false,
					message: "Resource already exists",
					error: "CONFLICT",
				};
			}

			// Validation errors
			if (
				error.message.includes("validation") ||
				error.message.includes("ValidationError")
			) {
				(set as { status?: number }).status = 400;
				return {
					success: false,
					message: "Validation failed",
					error: "VALIDATION_ERROR",
				};
			}

			// Authentication errors
			if (
				error.message.includes("Authentication failed") ||
				error.message.includes("Unauthorized")
			) {
				(set as { status?: number }).status = 401;
				return {
					success: false,
					message: "Authentication failed",
					error: "UNAUTHORIZED",
				};
			}

			// Authorization errors
			if (
				error.message.includes("permission") ||
				error.message.includes("Access denied")
			) {
				(set as { status?: number }).status = 403;
				return {
					success: false,
					message: "Access denied",
					error: "FORBIDDEN",
				};
			}

			// Not found errors
			if (
				error.message.includes("not found") ||
				error.message.includes("Not Found")
			) {
				(set as { status?: number }).status = 404;
				return {
					success: false,
					message: "Resource not found",
					error: "NOT_FOUND",
				};
			}
		}

		// Default internal server error
		(set as { status?: number }).status = 500;
		return {
			success: false,
			message: "Internal server error",
			error: "INTERNAL_ERROR",
		};
	})
	.as("global");
