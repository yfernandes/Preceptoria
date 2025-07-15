import { test, expect } from "@playwright/test";

function extractSessionCookie(
	setCookieHeader: string | string[] | undefined
): string {
	if (!setCookieHeader) return "";
	const cookies = Array.isArray(setCookieHeader)
		? setCookieHeader
		: [setCookieHeader];
	const sessionCookie = cookies.find((c) => c.startsWith("session="));
	return sessionCookie ? sessionCookie.split(";")[0] : "";
}

test.describe("Classes Data", () => {
	test("should fetch classes from API with authentication", async ({
		request,
	}) => {
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
		const setCookieHeader = loginResponse.headers()["set-cookie"];
		expect(setCookieHeader).toBeDefined();
		const sessionCookie = extractSessionCookie(setCookieHeader);
		expect(sessionCookie).not.toBe("");
		const response = await request.get("http://localhost:3000/classes", {
			headers: { Cookie: sessionCookie },
		});
		expect(response.status()).toBe(200);
		const data = await response.json();
		expect(data.success).toBe(true);
		expect(Array.isArray(data.data)).toBe(true);
	});

	test("should display classes data or empty state on classes page after login", async ({
		page,
	}) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "yagoalmeida@gmail.com");
		await page.fill('[data-testid="password"]', "TotallyS3cr3tP4ssw_rd");
		await page.click('[data-testid="login-button"]');
		await expect(page).toHaveURL("/classes");
		await expect(page.locator("h1")).toContainText("Classes");

		const tableVisible = await page
			.locator('[data-testid="classes-table"]')
			.isVisible();
		const emptyVisible = await page
			.locator("text=No classes found")
			.isVisible();

		if (!tableVisible && !emptyVisible) {
			const content = await page.content();
			throw new Error(
				"Neither classes table nor empty state found. Page content: " + content
			);
		}
	});

	test("should redirect to login when accessing classes without authentication", async ({
		page,
	}) => {
		await page.goto("/classes");
		await expect(page).toHaveURL("/login");
	});
});
