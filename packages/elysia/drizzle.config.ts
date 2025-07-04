import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DB_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASS || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'preceptoria_dev'}`,
	},
	// Minimal config - only used for Studio
	schema: "./src/entities/*.ts",
	verbose: false,
});
