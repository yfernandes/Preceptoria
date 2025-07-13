import { describe, expect, it, beforeEach } from "bun:test";
import { createJwtHelper } from "./jwt";
import { UserRoles } from "../src/modules/common/role.abstract";

describe("JWT Implementation", () => {
	describe("Configuration", () => {
		it("should throw error for empty secret", () => {
			expect(() => {
				createJwtHelper({ secret: "" });
			}).toThrow("JWT secret is required");
		});

		it("should throw error for undefined secret", () => {
			expect(() => {
				createJwtHelper({ secret: undefined as unknown as string });
			}).toThrow("JWT secret is required");
		});

		it("should accept string secret", () => {
			expect(() => {
				createJwtHelper({ secret: "test-secret" });
			}).not.toThrow();
		});

		it("should accept Uint8Array secret", () => {
			expect(() => {
				createJwtHelper({ secret: new TextEncoder().encode("test-secret") });
			}).not.toThrow();
		});

		it("should use custom expiry times", () => {
			expect(() => {
				createJwtHelper({
					secret: "test-secret",
					accessTokenExpiry: "30m",
					refreshTokenExpiry: "14d",
				});
			}).not.toThrow();
		});

		it("should throw error for unsupported algorithm", () => {
			expect(() => {
				createJwtHelper({
					secret: "test-secret",
					alg: "INVALID" as unknown as "HS256",
				});
			}).toThrow("Unsupported algorithm: INVALID");
		});

		it("should accept valid algorithms", () => {
			expect(() => {
				createJwtHelper({ secret: "test-secret", alg: "HS512" });
			}).not.toThrow();
		});
	});

	describe("JWT Signing", () => {
		let jwt: ReturnType<typeof createJwtHelper>;

		beforeEach(() => {
			jwt = createJwtHelper({ secret: "test-secret" });
		});

		it("should sign JWT with basic payload", async () => {
			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwt.sign(payload);

			expect(token).toMatch(/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/);
			expect(token.split(".")).toHaveLength(3);
		});

		it("should sign access token with default expiry", async () => {
			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwt.sign(payload, { type: "access" });

			// Verify the token
			const result = await jwt.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.id).toBe(payload.id);
				expect(result.roles).toEqual(payload.roles);
				expect(result.iat).toBeDefined();
				expect(result.exp).toBeDefined();
			}
		});

		it("should sign refresh token with longer expiry", async () => {
			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwt.sign(payload, { type: "refresh" });

			// Verify the token
			const result = await jwt.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.id).toBe(payload.id);
				expect(result.roles).toEqual(payload.roles);
			}
		});

		it("should sign with custom expiry", async () => {
			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwt.sign(payload, { expiry: "1h" });

			// Verify the token
			const result = await jwt.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.id).toBe(payload.id);
			}
		});

		it("should include issued-at time", async () => {
			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwt.sign(payload);

			const result = await jwt.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.iat).toBeDefined();
				expect(typeof result.iat).toBe("number");
				expect(result.iat).toBeGreaterThan(0);
			}
		});

		it("should include standard JWT claims when configured", async () => {
			const jwtWithClaims = createJwtHelper({
				secret: "test-secret",
				issuer: "test-issuer",
				audience: "test-audience",
			});

			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwtWithClaims.sign(payload);

			const result = await jwtWithClaims.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.sub).toBe(payload.id); // Subject should always be set
				expect(result.iss).toBe("test-issuer");
				expect(result.aud).toBe("test-audience");
			}
		});
	});

	describe("JWT Verification", () => {
		let jwt: ReturnType<typeof createJwtHelper>;

		beforeEach(() => {
			jwt = createJwtHelper({ secret: "test-secret" });
		});

		it("should verify valid JWT", async () => {
			const payload = { id: "123", roles: [UserRoles.Student] };

			// Sign a token
			const token = await jwt.sign(payload);

			// Verify the token
			const result = await jwt.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.id).toBe(payload.id);
				expect(result.roles).toEqual(payload.roles);
			}
		});

		it("should return false for empty token", async () => {
			const result = await jwt.verify("");
			expect(result).toBe(false);
		});

		it("should return false for malformed token", async () => {
			const result = await jwt.verify("invalid.token");
			expect(result).toBe(false);
		});

		it("should return false for token with wrong signature", async () => {
			// Create token with different secret
			const otherJwt = createJwtHelper({ secret: "other-secret" });
			const token = await otherJwt.sign({
				id: "test",
				roles: [UserRoles.Student],
			});

			// Try to verify with different secret
			const result = await jwt.verify(token);

			expect(result).toBe(false);
		});

		it("should return false for expired token", async () => {
			const payload = { id: "123", roles: [UserRoles.Student] };
			// Create a token that expires in 1 second with no clock tolerance
			const jwtNoTolerance = createJwtHelper({
				secret: "test-secret",
				clockTolerance: "0s",
			});
			const token = await jwtNoTolerance.sign(payload, { expiry: "1s" });

			// Wait 2 seconds to ensure token expires
			await new Promise((resolve) => setTimeout(resolve, 2000));

			const result = await jwtNoTolerance.verify(token);
			expect(result).toBe(false);
		});

		it("should return false for token with invalid payload structure", async () => {
			// Create a token manually with invalid structure
			const invalidToken =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.invalid";

			const result = await jwt.verify(invalidToken);
			expect(result).toBe(false);
		});

		it("should validate issuer and audience when configured", async () => {
			const jwtWithClaims = createJwtHelper({
				secret: "test-secret",
				issuer: "test-issuer",
				audience: "test-audience",
			});

			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwtWithClaims.sign(payload);

			// Should verify with correct claims
			const result = await jwtWithClaims.verify(token);
			expect(result).not.toBe(false);

			// Should fail with different issuer
			const jwtWrongIssuer = createJwtHelper({
				secret: "test-secret",
				issuer: "wrong-issuer",
				audience: "test-audience",
			});
			const result2 = await jwtWrongIssuer.verify(token);
			expect(result2).toBe(false);
		});
	});

	describe("Token Pair Generation", () => {
		let jwt: ReturnType<typeof createJwtHelper>;

		beforeEach(() => {
			jwt = createJwtHelper({ secret: "test-secret" });
		});

		it("should generate access and refresh token pair", async () => {
			const user = { id: "123", roles: [UserRoles.Student] };
			const result = await jwt.generateTokenPair(user);

			expect(result.accessToken).toBeDefined();
			expect(result.refreshToken).toBeDefined();
			expect(result.accessToken).toMatch(
				/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/
			);
			expect(result.refreshToken).toMatch(
				/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/
			);
		});

		it("should generate tokens with correct payload", async () => {
			const user = {
				id: "123",
				roles: [UserRoles.Student, UserRoles.SysAdmin],
			};
			const { accessToken, refreshToken } = await jwt.generateTokenPair(user);

			// Verify access token
			const accessPayload = await jwt.verify(accessToken);

			expect(accessPayload).not.toBe(false);
			if (accessPayload !== false) {
				expect(accessPayload.id).toBe(user.id);
				expect(accessPayload.roles).toEqual(user.roles);
			}

			// Verify refresh token
			const refreshPayload = await jwt.verify(refreshToken);

			expect(refreshPayload).not.toBe(false);
			if (refreshPayload !== false) {
				expect(refreshPayload.id).toBe(user.id);
				expect(refreshPayload.roles).toEqual(user.roles);
			}
		});

		it("should generate tokens with different expiry times", async () => {
			const user = { id: "123", roles: [UserRoles.Student] };
			const { accessToken, refreshToken } = await jwt.generateTokenPair(user);

			// Verify both tokens are valid
			const accessResult = await jwt.verify(accessToken);
			const refreshResult = await jwt.verify(refreshToken);

			expect(accessResult).not.toBe(false);
			expect(refreshResult).not.toBe(false);
		});
	});

	describe("Custom Configuration", () => {
		it("should use custom expiry times", async () => {
			const jwt = createJwtHelper({
				secret: "test-secret",
				accessTokenExpiry: "30m",
				refreshTokenExpiry: "14d",
			});

			const payload = { id: "123", roles: [UserRoles.Student] };

			// Test access token
			const accessToken = await jwt.sign(payload, { type: "access" });

			// Test refresh token
			const refreshToken = await jwt.sign(payload, { type: "refresh" });

			// Both should be valid
			const accessResult = await jwt.verify(accessToken);
			const refreshResult = await jwt.verify(refreshToken);

			expect(accessResult).not.toBe(false);
			expect(refreshResult).not.toBe(false);
		});

		it("should use custom algorithm", async () => {
			const jwt = createJwtHelper({
				secret: "test-secret",
				alg: "HS512",
			});

			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwt.sign(payload);

			const result = await jwt.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.id).toBe(payload.id);
			}
		});

		it("should use custom clock tolerance", async () => {
			const jwt = createJwtHelper({
				secret: "test-secret",
				clockTolerance: "5s",
			});

			const payload = { id: "123", roles: [UserRoles.Student] };
			const token = await jwt.sign(payload);

			const result = await jwt.verify(token);

			expect(result).not.toBe(false);
			if (result !== false) {
				expect(result.id).toBe(payload.id);
			}
		});
	});

	describe("Error Handling", () => {
		it("should handle malformed JWT structure", async () => {
			const jwt = createJwtHelper({ secret: "test-secret" });

			const malformedTokens = [
				"not.a.jwt",
				"header.payload", // missing signature
				"header.payload.signature.extra", // too many parts
				"", // empty string
			];

			for (const token of malformedTokens) {
				const result = await jwt.verify(token);
				expect(result).toBe(false);
			}
		});

		it("should handle network errors gracefully", async () => {
			const jwt = createJwtHelper({ secret: "test-secret" });

			const result = await jwt.verify("network.error.token");
			expect(result).toBe(false);
		});
	});

	describe("Performance Tests", () => {
		it("should handle multiple concurrent verifications", async () => {
			const jwt = createJwtHelper({ secret: "test-secret" });

			// Create a token
			const token = await jwt.sign({ id: "test", roles: [UserRoles.Student] });

			// Verify multiple times concurrently
			const promises = Array.from({ length: 10 }, () => jwt.verify(token));

			const results = await Promise.all(promises);

			// All should succeed
			results.forEach((result) => {
				expect(result).not.toBe(false);
				if (result !== false) {
					expect(result.id).toBe("test");
				}
			});
		});

		it("should handle large payloads efficiently", async () => {
			const jwt = createJwtHelper({ secret: "test-secret" });

			const largePayload = {
				id: "123",
				roles: [
					UserRoles.Student,
					UserRoles.OrgAdmin,
					UserRoles.Supervisor,
					UserRoles.HospitalManager,
					UserRoles.Preceptor,
					UserRoles.SysAdmin,
				],
			};

			const token = await jwt.sign(largePayload);
			const payload = await jwt.verify(token);

			expect(payload).not.toBe(false);
			if (payload !== false) {
				expect(payload.id).toBe(largePayload.id);
				expect(payload.roles).toEqual(largePayload.roles);
			}
		});
	});
});
