import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
	test("should login with valid credentials and redirect to classes", async ({
		page,
	}) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "yagoalmeida@gmail.com");
		await page.fill('[data-testid="password"]', "TotallyS3cr3tP4ssw_rd");
		await page.click('[data-testid="login-button"]');
		await expect(page).toHaveURL("/classes");
		await expect(page.locator("h1")).toContainText("Classes");
	});

	test("should show error with invalid credentials", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "invalid@email.com");
		await page.fill('[data-testid="password"]', "wrongpassword");
		await page.click('[data-testid="login-button"]');
		await expect(page).toHaveURL("/login");
		await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
	});

	test("should access protected route after login", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "yagoalmeida@gmail.com");
		await page.fill('[data-testid="password"]', "TotallyS3cr3tP4ssw_rd");
		await page.click('[data-testid="login-button"]');
		await expect(page).toHaveURL("/classes");
		await expect(page.locator("h1")).toContainText("Classes");
	});
});
