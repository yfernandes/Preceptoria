import Elysia from "elysia";

// --- Health Check ---
export const healthController = new Elysia().get("health", () => ({
	status: "ok",
	timestamp: new Date().toISOString(),
	uptime: process.uptime(),
	environment: Bun.env.NODE_ENV ?? "development",
}));
