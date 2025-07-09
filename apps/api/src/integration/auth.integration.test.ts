import { describe, it, expect } from "bun:test";
import { app } from "../server";
import { RequestContext } from "@mikro-orm/core";
import { db } from "../db";

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

			// Debug: Check login response
			console.log("Login response status:", loginResponse.status);
			const loginData = await loginResponse.json();
			console.log("Login response data:", JSON.stringify(loginData, null, 2));

			expect(loginResponse.status).toBe(200);
			expect(loginData.success).toBe(true);

			// Get the session cookie from the response
			const setCookieHeader = loginResponse.headers.get("set-cookie");
			// Extract both session and refresh cookies
			const sessionMatch = setCookieHeader?.match(/session=([^;]+)/);
			const refreshMatch = setCookieHeader?.match(/refresh=([^;]+)/);
			const sessionValue = sessionMatch?.[1];
			const refreshValue = refreshMatch?.[1];
			expect(sessionValue).toBeDefined();
			expect(refreshValue).toBeDefined();

			// Wrap the protected route call in a MikroORM RequestContext
			await new Promise((resolve, reject) => {
				RequestContext.create(db.orm.em, async () => {
					try {
						const response = await app.handle(
							new Request("http://localhost/users", {
								headers: {
									Cookie: `session=${JSON.stringify({ CookieValue: sessionValue })}; refresh=${JSON.stringify({ CookieValue: refreshValue })}`,
								},
							})
						);
						expect(response.status).toBe(200);
						resolve(undefined);
					} catch (err) {
						reject(err);
					}
				});
			});
		});
	});
});
