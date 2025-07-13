// --- Environment Validation ---
const requiredEnvVars = [
	"JWT_SECRET",
	"DB_HOST",
	"DB_USER",
	"DB_PASS",
	"DB_NAME",
	"GOOGLE_SPREADSHEET_ID",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !Bun.env[envVar]);
if (missingEnvVars.length > 0) {
	console.error("❌ Missing required environment variables:", missingEnvVars);
	console.error(
		"Please check your .env file and ensure all required variables are set."
	);
	process.exit(1);
}

console.log(
	`✅ Environment variables validated successfully (${Bun.env.NODE_ENV ?? "development"} mode)`
);

// --- Database ---
import { initORM } from "@api/infrastructure/database/db";
export const db = await initORM();

// --- Import and start server ---
import { app } from "./server";

// Export the app type for Eden Treaty - this is the single source of truth
export type App = typeof app;

// Get port from CLI arg, env, or default
const argPort = process.argv.find((arg) => arg.startsWith("--port="));
const cliPort = argPort ? Number(argPort.split("=")[1]) : undefined;
const envPort = Bun.env.PORT ? Number(Bun.env.PORT) : undefined;
const PORT = cliPort ?? envPort ?? 3000;

try {
	app.listen(PORT);

	if (app.server) {
		console.log(
			`🦊 Elysia is running at ${app.server.hostname}:${app.server.port.toString()}`
		);
	}

	// --- Graceful Shutdown ---
	const gracefulShutdown = async (signal: string) => {
		console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
		try {
			await db.orm.close();
			console.log("✅ Database connections closed");

			if (app.server) {
				app.server.stop();
				console.log("✅ Server stopped");
			}
			console.log("✅ Graceful shutdown completed");
			process.exit(0);
		} catch (error) {
			console.error("❌ Error during graceful shutdown:", error);
			process.exit(1);
		}
	};

	process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
	process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
} catch (error) {
	console.error("Failed to start server:", error);
	process.exit(1);
}
