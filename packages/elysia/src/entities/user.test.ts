import { describe, it, expect } from "bun:test";
import { User } from "./user.entity";
import { UserRoles } from "./role.abstract";

describe("User Entity", () => {
	describe("User.create()", () => {
		it("should create a valid user", async () => {
			const user = await User.create(
				"John Doe",
				"john@example.com",
				"+5511999999999",
				"password123"
			);

			expect(user.name).toBe("John Doe");
			expect(user.email).toBe("john@example.com");
			expect(user.phoneNumber).toBe("+5511999999999");
			expect(user.passwordHash).toBeDefined();
			expect(user.passwordHash).not.toBe("password123"); // Should be hashed
			expect(user.roles).toEqual([]);
			expect(user.id).toBeDefined();
			expect(user.createdAt).toBeInstanceOf(Date);
			expect(user.updatedAt).toBeInstanceOf(Date);
		});

		it("should hash the password", async () => {
			const user = await User.create(
				"Test User",
				"test@example.com",
				"+5511999999999",
				"myPassword123"
			);

			// Verify password is hashed
			expect(user.passwordHash).not.toBe("myPassword123");
			expect(user.passwordHash.length).toBeGreaterThan(20); // Hash should be longer than plain text
		});

		it("should validate email format", async () => {
			await expect(
				User.create(
					"Test User",
					"invalid-email",
					"+5511999999999",
					"password123"
				)
			).rejects.toThrow();
		});

		it("should validate phone number format", async () => {
			await expect(
				User.create(
					"Test User",
					"test@example.com",
					"invalid-phone",
					"password123"
				)
			).rejects.toThrow();
		});

		it("should validate password minimum length", async () => {
			await expect(
				User.create("Test User", "test@example.com", "+5511999999999", "123")
			).rejects.toThrow();
		});

		it("should validate required fields", async () => {
			// Test with empty name
			await expect(
				User.create("", "test@example.com", "+5511999999999", "password123")
			).rejects.toThrow();

			// Test with empty email
			await expect(
				User.create("Test User", "", "+5511999999999", "password123")
			).rejects.toThrow();

			// Test with empty phone
			await expect(
				User.create("Test User", "test@example.com", "", "password123")
			).rejects.toThrow();

			// Test with empty password
			await expect(
				User.create("Test User", "test@example.com", "+5511999999999", "")
			).rejects.toThrow();
		});
	});

	describe("User properties", () => {
		it("should have default empty roles array", async () => {
			const user = await User.create(
				"Test User",
				"test@example.com",
				"+5511999999999",
				"password123"
			);

			expect(user.roles).toEqual([]);
		});

		it("should allow role assignment", async () => {
			const user = await User.create(
				"Test User",
				"test@example.com",
				"+5511999999999",
				"password123"
			);

			user.roles = [UserRoles.Student, UserRoles.Preceptor];

			expect(user.roles).toEqual([UserRoles.Student, UserRoles.Preceptor]);
		});

		it("should have unique ID", async () => {
			const user1 = await User.create(
				"User 1",
				"user1@example.com",
				"+5511999999999",
				"password123"
			);

			const user2 = await User.create(
				"User 2",
				"user2@example.com",
				"+5511999999998",
				"password123"
			);

			expect(user1.id).not.toBe(user2.id);
		});

		it("should set timestamps", async () => {
			const beforeCreation = new Date();
			const user = await User.create(
				"Test User",
				"test@example.com",
				"+5511999999999",
				"password123"
			);
			const afterCreation = new Date();

			expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
				beforeCreation.getTime()
			);
			expect(user.createdAt.getTime()).toBeLessThanOrEqual(
				afterCreation.getTime()
			);
			expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
				beforeCreation.getTime()
			);
			expect(user.updatedAt.getTime()).toBeLessThanOrEqual(
				afterCreation.getTime()
			);
		});
	});

	describe("User relationships", () => {
		it("should have optional role relationships", async () => {
			const user = await User.create(
				"Test User",
				"test@example.com",
				"+5511999999999",
				"password123"
			);

			// All role relationships should be undefined by default
			expect(user.sysAdmin).toBeUndefined();
			expect(user.orgAdmin).toBeUndefined();
			expect(user.supervisor).toBeUndefined();
			expect(user.hospitalManager).toBeUndefined();
			expect(user.preceptor).toBeUndefined();
			expect(user.student).toBeUndefined();
		});
	});
});
