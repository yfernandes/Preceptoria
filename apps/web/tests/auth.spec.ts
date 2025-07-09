import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
	test("should login with valid credentials and redirect to classes", async ({
		page,
	}) => {
		await page.goto("/login");

		// Fill in the login form
		await page.fill('[data-testid="email"]', "yagoalmeida@gmail.com");
		await page.fill('[data-testid="password"]', "TotallyS3cr3tP4ssw_rd");

		// Submit the form
		await page.click('[data-testid="login-button"]');

		// Should redirect to classes after successful login
		await expect(page).toHaveURL("/classes");

		// Should show classes page content
		await expect(page.locator("h1")).toContainText("Classes");
	});

	test("should show error with invalid credentials", async ({ page }) => {
		await page.goto("/login");

		// Fill in invalid credentials
		await page.fill('[data-testid="email"]', "invalid@email.com");
		await page.fill('[data-testid="password"]', "wrongpassword");

		// Submit the form
		await page.click('[data-testid="login-button"]');

		// Should stay on login page
		await expect(page).toHaveURL("/login");

		// Should show error message
		await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
	});

	test("should access classes page after login", async ({ page }) => {
		// First login
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "yagoalmeida@gmail.com");
		await page.fill('[data-testid="password"]', "TotallyS3cr3tP4ssw_rd");
		await page.click('[data-testid="login-button"]');

		// Should be on classes page
		await expect(page).toHaveURL("/classes");

		// Should show user name in header
		await expect(page.locator("text=Olá,")).toBeVisible();
	});
});
