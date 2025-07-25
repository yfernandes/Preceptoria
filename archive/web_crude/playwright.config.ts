import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:4123",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		headless: true, // Run in headless mode to avoid spawning browser windows
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		command: "bun run dev",
		url: "http://localhost:4123",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
