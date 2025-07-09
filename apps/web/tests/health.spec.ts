import { test, expect } from "@playwright/test";

test.describe("Health Check", () => {
	test("should verify API health endpoint", async ({ request }) => {
		// Test the API health endpoint directly
		const response = await request.get("http://localhost:3000/health");

		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(data.status).toBe("ok");
		expect(data.timestamp).toBeDefined();
		expect(data.environment).toBeDefined();
	});

	test("should load the home page", async ({ page }) => {
		await page.goto("/");

		// Should show the Preceptoria title
		await expect(page.locator("h1")).toContainText("Preceptoria");

		// Should have a login link
		await expect(page.locator('a[href="/login"]')).toBeVisible();
	});
});
