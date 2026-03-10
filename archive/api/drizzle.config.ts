import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from .env.development file
config({ path: ".env.development" });

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url:
			process.env.DB_URL ||
			`postgresql://${process.env.DB_USER || "postgres"}:${process.env.DB_PASS || "postgres"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "preceptoria_dev"}`,
	},
	verbose: true, // Enable verbose logging to debug connection issues
});
