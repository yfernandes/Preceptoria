import { test, expect } from "@playwright/test";

test.describe("Classes Data", () => {
	test("should fetch classes from API with authentication", async ({
		request,
	}) => {
		// First login to get session cookie
		const loginResponse = await request.post(
			"http://localhost:3000/auth/signin",
			{
				data: {
					email: "yagoalmeida@gmail.com",
					password: "TotallyS3cr3tP4ssw_rd",
				},
			}
		);

		expect(loginResponse.status()).toBe(200);

		// Get cookies from login response
		const cookies = loginResponse.headers()["set-cookie"];
		expect(cookies).toBeDefined();

		// Now test classes endpoint with authentication
		const response = await request.get("http://localhost:3000/classes", {
			headers: {
				Cookie: cookies,
			},
		});

		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(data.success).toBe(true);
		expect(Array.isArray(data.data)).toBe(true);
	});

	test("should display classes data on classes page after login", async ({
		page,
	}) => {
		// First login
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "yagoalmeida@gmail.com");
		await page.fill('[data-testid="password"]', "TotallyS3cr3tP4ssw_rd");
		await page.click('[data-testid="login-button"]');

		// Should redirect to classes page
		await expect(page).toHaveURL("/classes");

		// Should show classes page
		await expect(page.locator("h1")).toContainText("Classes");

		// Should display classes data
		await expect(page.locator('[data-testid="classes-table"]')).toBeVisible();
		// Note: We can't test exact count since it depends on API data
	});

	test("should redirect to login when accessing classes without authentication", async ({
		page,
	}) => {
		// Try to access classes page without login
		await page.goto("/classes");

		// Should redirect to login
		await expect(page).toHaveURL("/login");
	});
});
