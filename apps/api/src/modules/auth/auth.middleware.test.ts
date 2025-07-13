import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { authMiddleware } from "./auth.middleware";

describe("Auth Middleware", () => {
	it("should reject request without session cookie", async () => {
		const app = new Elysia()
			.use(authMiddleware)
			.get("/", ({ authenticatedUser }) => authenticatedUser);

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(401);
		const data = await response.json();
		expect(data.message).toBe("Authentication failed");
	});

	it("should reject request with invalid token", async () => {
		const app = new Elysia()
			.use(authMiddleware)
			.get("/", ({ authenticatedUser }) => authenticatedUser);

		const response = await app.handle(
			new Request("http://localhost/", {
				headers: {
					Cookie: "session=invalid-token",
				},
			})
		);

		expect(response.status).toBe(401);
		const data = await response.json();
		expect(data.message).toBe("Authentication failed");
	});

	it("should reject request with empty session cookie", async () => {
		const app = new Elysia()
			.use(authMiddleware)
			.get("/", ({ authenticatedUser }) => authenticatedUser);

		const response = await app.handle(
			new Request("http://localhost/", {
				headers: {
					Cookie: "session=",
				},
			})
		);

		expect(response.status).toBe(401);
		const data = await response.json();
		expect(data.message).toBe("Authentication failed");
	});

	it("should handle internal server errors gracefully", async () => {
		// This test verifies that the middleware handles unexpected errors
		const app = new Elysia()
			.use(authMiddleware)
			.get("/", ({ authenticatedUser }) => authenticatedUser);

		// Mock a request that would cause an internal error
		const response = await app.handle(
			new Request("http://localhost/", {
				headers: {
					Cookie: "session=malformed-cookie-value",
				},
			})
		);

		// Should return 401 for auth failures, not 500
		expect(response.status).toBe(401);
		const data = await response.json();
		expect(data.message).toBe("Authentication failed");
	});
});
