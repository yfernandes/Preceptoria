import { test, expect } from "@playwright/test";

test.describe("Health Check", () => {
	test("should verify API is reachable and returns correct format", async ({
		request,
	}) => {
		const response = await request.get("http://localhost:3000/health");
		expect(response.status()).toBe(200);
		const data = await response.json();
		expect(data).toMatchObject({ status: "ok" });
		expect(typeof data.timestamp).toBe("string");
		expect(["development", "production", "test"]).toContain(data.environment);
	});

	test("should load the home page with login link", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toContainText("Preceptoria");
		await expect(page.locator('a[href="/login"]')).toBeVisible();
	});
});
