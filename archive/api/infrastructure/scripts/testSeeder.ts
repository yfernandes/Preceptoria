#!/usr/bin/env bun

import { initORM } from "@api/db"
import type { EntityManager } from "@mikro-orm/postgresql"
import { DatabaseSeeder } from "../database/seeders/DatabaseSeeder"

// Environment validation
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
	console.error("❌ Missing required environment variables:", missingEnvVars)
	console.error("Please check your .env file and ensure all required variables are set.")
	process.exit(1)
}

async function main() {
	try {
		console.log("🌱 Testing database seeder...")

		// Initialize ORM and get entity manager
		const services = await initORM()
		const em = services.em.fork() as EntityManager

		// Run the seeder
		const seeder = new DatabaseSeeder()
		await seeder.run(em)

		console.log("✅ Seeder test completed successfully!")

		// Close the connection
		await services.orm.close()

		process.exit(0)
	} catch (error) {
		console.error("💥 Seeder test failed:", error)
		process.exit(1)
	}
}

await main()
