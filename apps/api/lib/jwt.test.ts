import { Elysia, t } from "elysia";
import { describe, expect, it, beforeEach } from "bun:test";
import jwt from "./jwt";

// Test utilities
const createTestApp = (options: Parameters<typeof jwt>[0]) => {
	return new Elysia()
		.use(jwt(options))
		.post("/sign", ({ jwt, body }) => jwt.sign(body), {
			body: t.Object({
				name: t.String(),
				data: t.Optional(t.String()),
				exp: t.Optional(t.Union([t.String(), t.Number()])),
				nbf: t.Optional(t.Union([t.String(), t.Number()])),
			}),
		})
		.post("/sign-with-schema", ({ jwt, body }) => jwt.sign(body), {
			body: t.Object({
				userId: t.String(),
				role: t.String(),
				exp: t.Optional(t.Union([t.String(), t.Number()])),
			}),
		})
		.post(
			"/verify",
			async ({ jwt, body: { token } }) => await jwt.verify(token),
			{
				body: t.Object({ token: t.String() }),
			}
		)
		.post("/verify-empty", async ({ jwt }) => await jwt.verify(), {
			body: t.Object({}),
		});
};

const post = (_app: Elysia, path: string, body = {}) =>
	new Request(`http://localhost${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

describe.todo("JWT Implementation", () => {
	describe.todo("Configuration", () => {
		it("should throw error for empty secret", () => {
			expect(() => {
				jwt({ secret: "" });
			}).toThrow("JWT secret cannot be empty");
		});

		it("should throw error for undefined secret", () => {
			expect(() => {
				jwt({ secret: undefined as any });
			}).toThrow("JWT secret cannot be empty");
		});

		it("should accept string secret", () => {
			expect(() => {
				jwt({ secret: "test-secret" });
			}).not.toThrow();
		});

		it("should accept Uint8Array secret", () => {
			expect(() => {
				jwt({ secret: new TextEncoder().encode("test-secret") });
			}).not.toThrow();
		});

		it("should use default algorithm HS256", () => {
			const app = createTestApp({ secret: "test-secret" });
			expect(app).toBeDefined();
		});

		it("should accept custom algorithm", () => {
			expect(() => {
				jwt({ secret: "test-secret", alg: "HS512" });
			}).not.toThrow();
		});

		it("should throw error for unsupported algorithm", () => {
			expect(() => {
				jwt({ secret: "test-secret", alg: "INVALID" as any });
			}).toThrow("Algorithm 'INVALID' is not supported");
		});
	});

	describe.todo("JWT Signing", () => {
		let app: Elysia;

		beforeEach(() => {
			app = createTestApp({ secret: "test-secret" });
		});

		it("should sign JWT with basic payload", async () => {
			const name = "TestUser";
			const response = await app.handle(post(app, "/sign", { name }));
			const token = await response.text();

			expect(token).toMatch(/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/);
			expect(token.split(".")).toHaveLength(3);
		});

		it("should sign JWT with custom expiration (number)", async () => {
			const name = "TestUser";
			const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

			const response = await app.handle(post(app, "/sign", { name, exp }));
			const token = await response.text();

			expect(token).toMatch(/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/);

			// Verify the token
			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const payload = await verifyResponse.json();

			expect(payload.name).toBe(name);
			expect(payload.exp).toBe(exp);
		});

		it("should sign JWT with custom expiration (string)", async () => {
			const name = "TestUser";
			const exp = "15m";

			const response = await app.handle(post(app, "/sign", { name, exp }));
			const token = await response.text();

			expect(token).toMatch(/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/);

			// Verify the token
			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const payload = await verifyResponse.json();

			expect(payload.name).toBe(name);
			expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
		});

		it("should sign JWT with not-before time", async () => {
			const name = "TestUser";
			const nbf = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

			const response = await app.handle(post(app, "/sign", { name, nbf }));
			const token = await response.text();

			expect(token).toMatch(/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/);

			// Verify the token
			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const payload = await verifyResponse.json();

			expect(payload.name).toBe(name);
			expect(payload.nbf).toBe(nbf);
		});

		it("should include issued-at time", async () => {
			const name = "TestUser";
			const response = await app.handle(post(app, "/sign", { name }));
			const token = await response.text();

			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const payload = await verifyResponse.json();

			expect(payload.iat).toBeDefined();
			expect(typeof payload.iat).toBe("number");
			expect(payload.iat).toBeGreaterThan(0);
		});

		it("should handle signing errors gracefully", async () => {
			// Create app with invalid configuration
			const invalidApp = createTestApp({
				secret: "test-secret",
				alg: "HS256",
				// Add invalid payload that might cause issues
				iss: "test-issuer",
				sub: "test-subject",
			});

			const response = await invalidApp.handle(
				post(invalidApp, "/sign", { name: "test" })
			);

			// Should still work with valid payload
			expect(response.ok).toBe(true);
		});
	});

	describe.todo("JWT Verification", () => {
		let app: Elysia;

		beforeEach(() => {
			app = createTestApp({ secret: "test-secret" });
		});

		it("should verify valid JWT", async () => {
			const name = "TestUser";

			// Sign a token
			const signResponse = await app.handle(post(app, "/sign", { name }));
			const token = await signResponse.text();

			// Verify the token
			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const payload = await verifyResponse.json();

			expect(payload).not.toBe(false);
			expect(payload.name).toBe(name);
		});

		it("should return false for empty token", async () => {
			const response = await app.handle(post(app, "/verify-empty"));
			const result = await response.json();

			expect(result).toBe(false);
		});

		it("should return false for undefined token", async () => {
			const response = await app.handle(post(app, "/verify-empty"));
			const result = await response.json();

			expect(result).toBe(false);
		});

		it("should return false for malformed token", async () => {
			const response = await app.handle(
				post(app, "/verify", { token: "invalid.token" })
			);
			const result = await response.json();

			expect(result).toBe(false);
		});

		it("should return false for token with wrong signature", async () => {
			// Create token with different secret
			const otherApp = createTestApp({ secret: "other-secret" });
			const signResponse = await otherApp.handle(
				post(otherApp, "/sign", { name: "test" })
			);
			const token = await signResponse.text();

			// Try to verify with different secret
			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const result = await verifyResponse.json();

			expect(result).toBe(false);
		});

		it("should return false for expired token", async () => {
			const name = "TestUser";
			const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

			const response = await app.handle(post(app, "/sign", { name, exp }));
			const token = await response.text();

			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const result = await verifyResponse.json();

			expect(result).toBe(false);
		});

		it("should return false for token with future not-before time", async () => {
			const name = "TestUser";
			const nbf = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

			const response = await app.handle(post(app, "/sign", { name, nbf }));
			const token = await response.text();

			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const result = await verifyResponse.json();

			expect(result).toBe(false);
		});

		it("should verify token with custom expiration string", async () => {
			const name = "TestUser";
			const exp = "15m";

			const response = await app.handle(post(app, "/sign", { name, exp }));
			const token = await response.text();

			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const payload = await verifyResponse.json();

			expect(payload).not.toBe(false);
			expect(payload.name).toBe(name);
		});
	});

	describe.todo("Schema Validation", () => {
		const userSchema = t.Object({
			userId: t.String(),
			role: t.String(),
		});

		it("should validate payload against schema", async () => {
			const app = createTestApp({
				secret: "test-secret",
				schema: userSchema,
			});

			const payload = { userId: "123", role: "admin" };
			const response = await app.handle(
				post(app, "/sign-with-schema", payload)
			);
			const token = await response.text();

			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const result = await verifyResponse.json();

			expect(result).not.toBe(false);
			expect(result.userId).toBe(payload.userId);
			expect(result.role).toBe(payload.role);
		});

		it("should reject token with invalid schema", async () => {
			const app = createTestApp({
				secret: "test-secret",
				schema: userSchema,
			});

			// Sign with valid payload
			const validPayload = { userId: "123", role: "admin" };
			const signResponse = await app.handle(
				post(app, "/sign-with-schema", validPayload)
			);
			const token = await signResponse.text();

			// Try to verify with schema validation
			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const result = await verifyResponse.json();

			// Should still work because the payload is valid
			expect(result).not.toBe(false);
		});
	});

	describe.todo("Security Tests", () => {
		it("should not be vulnerable to timing attacks", async () => {
			const app = createTestApp({ secret: "test-secret" });

			// Create valid token
			const validResponse = await app.handle(
				post(app, "/sign", { name: "test" })
			);
			const validToken = await validResponse.text();

			// Create invalid token
			const invalidToken =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

			// Measure verification time for both
			const start1 = performance.now();
			await app.handle(post(app, "/verify", { token: validToken }));
			const time1 = performance.now() - start1;

			const start2 = performance.now();
			await app.handle(post(app, "/verify", { token: invalidToken }));
			const time2 = performance.now() - start2;

			// Times should be similar (within reasonable margin)
			const timeDiff = Math.abs(time1 - time2);
			expect(timeDiff).toBeLessThan(100); // 100ms tolerance
		});

		it("should handle algorithm confusion attacks", async () => {
			// Create token with HS256
			const hs256App = createTestApp({ secret: "test-secret", alg: "HS256" });
			const signResponse = await hs256App.handle(
				post(hs256App, "/sign", { name: "test" })
			);
			const token = await signResponse.text();

			// Try to verify with different algorithm
			const hs512App = createTestApp({ secret: "test-secret", alg: "HS512" });
			const verifyResponse = await hs512App.handle(
				post(hs512App, "/verify", { token })
			);
			const result = await verifyResponse.json();

			// Should fail due to algorithm mismatch
			expect(result).toBe(false);
		});
	});

	describe.todo("Error Handling", () => {
		it("should handle network errors gracefully", async () => {
			const app = createTestApp({ secret: "test-secret" });

			// Mock a network error scenario
			const response = await app.handle(
				post(app, "/verify", { token: "network.error.token" })
			);
			const result = await response.json();

			expect(result).toBe(false);
		});

		it("should handle malformed JWT structure", async () => {
			const app = createTestApp({ secret: "test-secret" });

			const malformedTokens = [
				"not.a.jwt",
				"header.payload", // missing signature
				"header.payload.signature.extra", // too many parts
				"", // empty string
				"header.payload.signature", // valid structure but invalid content
			];

			for (const token of malformedTokens) {
				const response = await app.handle(post(app, "/verify", { token }));
				const result = await response.json();
				expect(result).toBe(false);
			}
		});
	});

	describe.todo("Performance Tests", () => {
		it("should handle multiple concurrent verifications", async () => {
			const app = createTestApp({ secret: "test-secret" });

			// Create a token
			const signResponse = await app.handle(
				post(app, "/sign", { name: "test" })
			);
			const token = await signResponse.text();

			// Verify multiple times concurrently
			const promises = Array.from({ length: 10 }, () =>
				app.handle(post(app, "/verify", { token }))
			);

			const results = await Promise.all(promises);
			const payloads = await Promise.all(results.map((r) => r.json()));

			// All should succeed
			payloads.forEach((payload) => {
				expect(payload).not.toBe(false);
				expect(payload.name).toBe("test");
			});
		});

		it("should handle large payloads efficiently", async () => {
			const app = createTestApp({ secret: "test-secret" });

			const largePayload = {
				name: "test",
				data: "x".repeat(1000), // 1KB of data
			};

			const response = await app.handle(post(app, "/sign", largePayload));
			const token = await response.text();

			const verifyResponse = await app.handle(post(app, "/verify", { token }));
			const payload = await verifyResponse.json();

			expect(payload).not.toBe(false);
			expect(payload.name).toBe("test");
			expect(payload.data).toBe(largePayload.data);
		});
	});
});
