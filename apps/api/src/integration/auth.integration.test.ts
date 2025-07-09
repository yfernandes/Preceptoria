import { describe, it, expect } from "bun:test";
import { app } from "../server";

const defaultSysAdminUser = {
	email: "yagoalmeida@gmail.com",
	password: "TotallyS3cr3tP4ssw_rd",
};

describe("Auth Integration Tests", () => {
	//  Health Check - Canary Test, if this fails, something is wrong with the server
	describe("Health Check", () => {
		it("should return health status", async () => {
			const response = await app.handle(new Request("http://localhost/health"));

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.status).toBe("ok");
			expect(data.timestamp).toBeDefined();
			expect(data.environment).toBeDefined();
		});
	});

	describe("Authentication Flow", () => {
		// It should login as the default SysAdmin User yagoalmeida@gmail.com pass: TotallyS3cr3tP4ssw_rd
		it("should login as the default SysAdmin User", async () => {
			const response = await app.handle(
				new Request("http://localhost/auth/signin", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: defaultSysAdminUser.email,
						password: defaultSysAdminUser.password,
					}),
				})
			);

			// Debug: Log the actual response
			console.log("Login response status:", response.status);
			const data = await response.json();
			console.log("Login response data:", JSON.stringify(data, null, 2));

			// Check if login was successful
			expect(response.status).toBe(200);

			expect(data.success).toBe(true);
			expect(data.user.email).toBe("yagoalmeida@gmail.com");

			// Check if cookies were set (for authentication)
			const setCookieHeader = response.headers.get("set-cookie");
			expect(setCookieHeader).toBeDefined();
			expect(setCookieHeader).toContain("session=");
		});

		it("should reject invalid credentials", async () => {
			const response = await app.handle(
				new Request("http://localhost/auth/signin", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: "yagoalmeida@gmail.com",
						password: "wrongpassword",
					}),
				})
			);

			// Should get 401 Unauthorized
			expect(response.status).toBe(401);

			const data = await response.json();
			expect(data.success).toBe(false);
			expect(data.message).toContain("incorrect");
		});

		// It should be able to access a protected route, with the default SysAdmin User
		it("should be able to access a protected route, with the default SysAdmin User", async () => {
			// First login to get the session cookie
			const loginResponse = await app.handle(
				new Request("http://localhost/auth/signin", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: defaultSysAdminUser.email,
						password: defaultSysAdminUser.password,
					}),
				})
			);

			// Debug: Check login response
			const loginData = await loginResponse.json();
			console.log("Login response:", loginData);

			expect(loginResponse.status).toBe(200);
			expect(loginData.success).toBe(true);

			// Get the session cookie from the response
			const setCookieHeader = loginResponse.headers.get("set-cookie");
			console.log("Set-Cookie header:", setCookieHeader);

			// Extract both session and refresh cookies
			const sessionMatch = setCookieHeader?.match(/session=([^;]+)/);
			const refreshMatch = setCookieHeader?.match(/refresh=([^;]+)/);
			const sessionValue = sessionMatch?.[1];
			const refreshValue = refreshMatch?.[1];

			expect(sessionValue).toBeDefined();
			expect(refreshValue).toBeDefined();

			// Now test accessing a protected route with the session cookie
			// Format cookies as expected by the validation schema
			const protectedResponse = await app.handle(
				new Request("http://localhost/classes", {
					method: "GET",
					headers: {
						Cookie: `session=${JSON.stringify({ CookieValue: sessionValue })}; refresh=${JSON.stringify({ CookieValue: refreshValue })}`,
					},
				})
			);

			console.log("Protected route status:", protectedResponse.status);
			const protectedData = await protectedResponse.json();
			console.log("Protected route response:", protectedData);

			// Should be able to access the protected route
			expect(protectedResponse.status).toBe(200);
			expect(protectedData.success).toBe(true);
			expect(Array.isArray(protectedData.data)).toBe(true);
		});
	});
});
