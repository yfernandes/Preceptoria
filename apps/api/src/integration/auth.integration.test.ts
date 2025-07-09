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
		it.skip("should login as the default SysAdmin User", async () => {
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

		it.skip("should reject invalid credentials", async () => {
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

		// It should be able to access a protected route, with the default SysAdmin User. The route is /api/users/
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

			// Get the session cookie from the response
			const sessionCookie = loginResponse.headers
				.get("set-cookie")
				?.split(";")[0];

			// Now try to access the protected route
			const response = await app.handle(
				new Request("http://localhost/users", {
					headers: {
						Cookie: `session=${sessionCookie}`,
					},
				})
			);

			expect(response.status).toBe(200);
		});
	});
});
