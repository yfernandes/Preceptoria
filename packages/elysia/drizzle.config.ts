import { defineConfig } from "drizzle-kit";
console.log(process.env.DB_URL.toString());

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DB_URL,
	},
});
