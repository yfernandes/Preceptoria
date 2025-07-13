import { describe, it, expect, beforeEach } from "bun:test";
import { SysAdmin } from "./SysAdmin.entity";
import { User } from "../user/user.entity";

describe("SysAdmin Entity", () => {
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
		it("should create a sys admin", () => {
			const sysAdmin = new SysAdmin(mockUser);

			expect(sysAdmin.user).toBe(mockUser);
		});

		it("should inherit from Role", () => {
			const sysAdmin = new SysAdmin(mockUser);

			expect(sysAdmin.id).toBeDefined();
			expect(sysAdmin.createdAt).toBeInstanceOf(Date);
			expect(sysAdmin.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const sysAdmin = new SysAdmin(mockUser);

			expect(sysAdmin.user).toBeDefined();
		});
	});

	describe("Relationships", () => {
		it("should have a user relationship", () => {
			const sysAdmin = new SysAdmin(mockUser);

			expect(sysAdmin.user).toBe(mockUser);
			expect(sysAdmin.user.name).toBe("Test User");
			expect(sysAdmin.user.email).toBe("test@example.com");
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const sysAdmin = new SysAdmin(mockUser);

			expect(sysAdmin).toBeInstanceOf(SysAdmin);
		});

		it("should inherit role properties", () => {
			const sysAdmin = new SysAdmin(mockUser);

			expect(sysAdmin.user).toBe(mockUser);
		});
	});
});
