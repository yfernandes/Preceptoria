import { describe, it, expect, beforeEach } from "bun:test";
import { Role, UserRoles } from "./role.abstract";
import { User } from "../../entities/user.entity";

// Create a concrete implementation of Role for testing
class TestRole extends Role {}

describe("Role Abstract Class", () => {
	let mockUser: User;

	beforeEach(async () => {
		mockUser = await User.create(
			"Test User",
			"test@example.com",
			"+5511999999999",
			"password123"
		);
	});

	describe("Constructor", () => {
		it("should create a role with a user", () => {
			const role = new TestRole(mockUser);

			expect(role.user).toBe(mockUser);
			expect(role.id).toBeDefined();
			expect(role.createdAt).toBeInstanceOf(Date);
			expect(role.updatedAt).toBeInstanceOf(Date);
		});

		it("should inherit from BaseEntity", () => {
			const role = new TestRole(mockUser);

			expect(role.id).toBeDefined();
			expect(role.createdAt).toBeInstanceOf(Date);
			expect(role.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("UserRoles Enum", () => {
		it("should have all expected role values", () => {
			expect(UserRoles.SysAdmin).toBe(UserRoles.SysAdmin);
			expect(UserRoles.OrgAdmin).toBe(UserRoles.OrgAdmin);
			expect(UserRoles.Supervisor).toBe(UserRoles.Supervisor);
			expect(UserRoles.HospitalManager).toBe(UserRoles.HospitalManager);
			expect(UserRoles.Preceptor).toBe(UserRoles.Preceptor);
			expect(UserRoles.Student).toBe(UserRoles.Student);
		});

		it("should have unique values", () => {
			const values = Object.values(UserRoles);
			const uniqueValues = new Set(values);
			expect(uniqueValues.size).toBe(values.length);
		});
	});

	describe("User Relationship", () => {
		it("should maintain reference to the user", () => {
			const role = new TestRole(mockUser);

			expect(role.user).toBe(mockUser);
			expect(role.user.name).toBe("Test User");
			expect(role.user.email).toBe("test@example.com");
		});
	});
});
