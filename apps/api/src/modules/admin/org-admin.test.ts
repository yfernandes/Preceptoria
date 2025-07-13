import { describe, it, expect, beforeEach } from "bun:test";
import { OrgAdmin } from "./OrgAdmin.entity";
import { User } from "@api/modules/users/user.entity";
import { School } from "@api/modules/school/school.entity";
import { Hospital } from "@api/modules/hospital";

describe("OrgAdmin Entity", () => {
	let mockUser: User;
	let mockSchool: School;
	let mockHospital: Hospital;

	beforeEach(async () => {
		mockUser = await User.create(
			"Test User",
			"test@example.com",
			"+5511999999999",
			"password123"
		);
		mockSchool = new School(
			"Test School",
			"Test Address",
			"school@test.com",
			"+5511888888888"
		);
		mockHospital = new Hospital(
			"Test Hospital",
			"Test Address",
			"hospital@test.com",
			"+5511777777777"
		);
	});

	describe("Constructor", () => {
		it("should create an org admin", () => {
			const orgAdmin = new OrgAdmin(mockUser);

			expect(orgAdmin.user).toBe(mockUser);
			expect(orgAdmin.school).toBeUndefined();
			expect(orgAdmin.hospital).toBeUndefined();
		});

		it("should inherit from Role", () => {
			const orgAdmin = new OrgAdmin(mockUser);

			expect(orgAdmin.id).toBeDefined();
			expect(orgAdmin.createdAt).toBeInstanceOf(Date);
			expect(orgAdmin.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const orgAdmin = new OrgAdmin(mockUser);

			expect(orgAdmin.user).toBeDefined();
			expect(orgAdmin.school === undefined || orgAdmin.school).toBe(true);
			expect(orgAdmin.hospital === undefined || orgAdmin.hospital).toBe(true);
		});
	});

	describe("Relationships", () => {
		it("should have a user relationship", () => {
			const orgAdmin = new OrgAdmin(mockUser);

			expect(orgAdmin.user).toBe(mockUser);
			expect(orgAdmin.user.name).toBe("Test User");
			expect(orgAdmin.user.email).toBe("test@example.com");
		});

		it("should have optional school relationship", () => {
			const orgAdmin = new OrgAdmin(mockUser);
			orgAdmin.school = mockSchool;

			expect(orgAdmin.school).toBe(mockSchool);
			expect(orgAdmin.school.name).toBe("Test School");
			expect(orgAdmin.school.address).toBe("Test Address");
		});

		it("should have optional hospital relationship", () => {
			const orgAdmin = new OrgAdmin(mockUser);
			orgAdmin.hospital = mockHospital;

			expect(orgAdmin.hospital).toBe(mockHospital);
			expect(orgAdmin.hospital.name).toBe("Test Hospital");
			expect(orgAdmin.hospital.address).toBe("Test Address");
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const orgAdmin = new OrgAdmin(mockUser);

			expect(orgAdmin).toBeInstanceOf(OrgAdmin);
		});

		it("should inherit role properties", () => {
			const orgAdmin = new OrgAdmin(mockUser);

			expect(orgAdmin.user).toBe(mockUser);
		});
	});
});
