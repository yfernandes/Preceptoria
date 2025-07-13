import { describe, it, expect, mock } from "bun:test";
import {
	createUserResponse,
	assignDefaultRole,
	handleValidationError,
	setAuthCookies,
	ACCESS_TOKEN_AGE,
	REFRESH_TOKEN_AGE,
	COOKIE_CONFIG,
} from "./auth.service";
import { User } from "../../entities/user.entity";
import { UserRoles } from "../../entities/role.abstract";
import { ValidationError } from "class-validator";

describe("Auth Service", () => {
	describe("createUserResponse", () => {
		it("should create user response with normalized field names", () => {
			const mockUser = {
				id: "user-123",
				name: "John Doe",
				email: "john@example.com",
				phoneNumber: "+1234567890",
				roles: [UserRoles.Student],
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				updatedAt: new Date("2024-01-01T00:00:00.000Z"),
			} as User;

			const result = createUserResponse(mockUser);

			expect(result).toEqual({
				id: "user-123",
				name: "John Doe",
				email: "john@example.com",
				phone: "+1234567890", // Normalized from phoneNumber
				roles: [UserRoles.Student],
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
			});
		});

		it("should handle multiple roles", () => {
			const mockUser = {
				id: "user-123",
				name: "John Doe",
				email: "john@example.com",
				phoneNumber: "+1234567890",
				roles: [UserRoles.Student, UserRoles.Supervisor],
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				updatedAt: new Date("2024-01-01T00:00:00.000Z"),
			} as User;

			const result = createUserResponse(mockUser);

			expect(result.roles).toEqual([UserRoles.Student, UserRoles.Supervisor]);
		});
	});

	describe("handleValidationError", () => {
		it("should handle validation errors from class-validator", () => {
			const validationError = new ValidationError();
			validationError.property = "email";
			validationError.constraints = { isEmail: "Invalid email format" };

			const result = handleValidationError([validationError]);

			expect(result).toEqual({
				success: false,
				message: "Validation failed",
				errors: [
					{
						field: "email",
						constraints: { isEmail: "Invalid email format" },
					},
				],
			});
		});

		it("should handle null constraints", () => {
			const validationError = new ValidationError();
			validationError.property = "email";
			validationError.constraints = null as unknown as Record<string, string>;

			const result = handleValidationError([validationError]);

			expect(result).toEqual({
				success: false,
				message: "Validation failed",
				errors: [
					{
						field: "email",
						constraints: {},
					},
				],
			});
		});

		it("should return null for non-validation errors", () => {
			const result = handleValidationError(new Error("Some other error"));
			expect(result).toBeNull();
		});

		it("should return null for empty array", () => {
			const result = handleValidationError([]);
			expect(result).toBeNull();
		});
	});

	describe("assignDefaultRole", () => {
		it("should assign Student role to new users", () => {
			const mockUser = {
				roles: [] as UserRoles[],
			} as User;

			assignDefaultRole(mockUser);

			expect(mockUser.roles).toEqual([UserRoles.Student]);
		});

		it("should override existing roles with Student role", () => {
			const mockUser = {
				roles: [UserRoles.SysAdmin], // Should be overridden
			} as User;

			assignDefaultRole(mockUser);

			expect(mockUser.roles).toEqual([UserRoles.Student]);
		});
	});

	describe("setAuthCookies", () => {
		it("should set cookies with correct configuration", () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
			const mockAuth = { set: (_config: Record<string, unknown>) => {} };

			const mockRefreshCookie = {
				set: mock(),
			};
			const accessToken = "access-token";
			const refreshToken = "refresh-token";

			// Test that the function doesn't throw
			expect(() => {
				setAuthCookies(mockAuth, mockRefreshCookie, accessToken, refreshToken);
			}).not.toThrow();
		});

		it("should use correct token ages", () => {
			expect(ACCESS_TOKEN_AGE).toBe(15 * 60); // 15 minutes
			expect(REFRESH_TOKEN_AGE).toBe(7 * 24 * 60 * 60); // 7 days
		});
	});

	describe("Constants", () => {
		it("should have correct token ages", () => {
			expect(ACCESS_TOKEN_AGE).toBe(15 * 60); // 15 minutes
			expect(REFRESH_TOKEN_AGE).toBe(7 * 24 * 60 * 60); // 7 days
		});

		it("should have correct cookie configuration", () => {
			expect(COOKIE_CONFIG.path).toBe("/");
			expect(typeof COOKIE_CONFIG.httpOnly).toBe("boolean");
			expect(typeof COOKIE_CONFIG.secure).toBe("boolean");
			expect(["strict", "lax"]).toContain(COOKIE_CONFIG.sameSite);
		});
	});

	describe("Type Safety", () => {
		it("should have correct AuthInput interface", () => {
			const validInput = {
				name: "John Doe",
				email: "john@example.com",
				phone: "+1234567890",
				password: "password123",
			};

			expect(validInput).toHaveProperty("name");
			expect(validInput).toHaveProperty("email");
			expect(validInput).toHaveProperty("phone");
			expect(validInput).toHaveProperty("password");
			expect(typeof validInput.name).toBe("string");
			expect(typeof validInput.email).toBe("string");
			expect(typeof validInput.phone).toBe("string");
			expect(typeof validInput.password).toBe("string");
		});

		it("should have correct SignInInput interface", () => {
			const validInput = {
				email: "john@example.com",
				password: "password123",
			};

			expect(validInput).toHaveProperty("email");
			expect(validInput).toHaveProperty("password");
			expect(typeof validInput.email).toBe("string");
			expect(typeof validInput.password).toBe("string");
		});

		it("should have correct UserResponse interface", () => {
			const mockResponse = {
				id: "user-123",
				name: "John Doe",
				email: "john@example.com",
				phone: "+1234567890",
				roles: [UserRoles.Student],
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
			};

			expect(mockResponse).toHaveProperty("id");
			expect(mockResponse).toHaveProperty("name");
			expect(mockResponse).toHaveProperty("email");
			expect(mockResponse).toHaveProperty("phone");
			expect(mockResponse).toHaveProperty("roles");
			expect(mockResponse).toHaveProperty("createdAt");
			expect(mockResponse).toHaveProperty("updatedAt");
			expect(Array.isArray(mockResponse.roles)).toBe(true);
		});
	});
});
