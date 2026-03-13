#!/usr/bin/env bun

import { execSync } from "node:child_process"

// Environment validation
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
	console.error("❌ Missing required environment variables:", missingEnvVars)
	console.error("Please check your .env file and ensure all required variables are set.")
	process.exit(1)
}

function main() {
	try {
		console.log("🌱 Running database seeder via MikroORM CLI...")

		// Run the seeder using MikroORM CLI
		execSync("bun run db:seed", {
			stdio: "inherit",
			env: process.env,
		})

		console.log("✅ Seeder completed successfully!")
		process.exit(0)
	} catch (error) {
		console.error("💥 Seeder failed:", error)
		process.exit(1)
	}
}

main()
