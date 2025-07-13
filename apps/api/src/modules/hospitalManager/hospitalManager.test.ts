import { describe, it, expect, beforeEach } from "bun:test";
import { HospitalManager } from "@api/modules/hospitalManager/hospitalManager.entity";
import { User } from "@api/entities/user.entity";
import { Hospital } from "@api/modules/hospital";

describe("HospitalManager Entity", () => {
	let mockUser: User;
	let mockHospital: Hospital;

	beforeEach(async () => {
		mockUser = await User.create(
			"Test User",
			"test@example.com",
			"+5511999999999",
			"password123"
		);
		mockHospital = new Hospital(
			"Test Hospital",
			"Test Address",
			"hospital@test.com",
			"+5511777777777"
		);
	});

	describe("Constructor", () => {
		it("should create a hospital manager with required fields", () => {
			const hospitalManager = new HospitalManager(mockUser, mockHospital);

			expect(hospitalManager.user).toBe(mockUser);
			expect(hospitalManager.hospital).toBe(mockHospital);
		});

		it("should inherit from Role", () => {
			const hospitalManager = new HospitalManager(mockUser, mockHospital);

			expect(hospitalManager.id).toBeDefined();
			expect(hospitalManager.createdAt).toBeInstanceOf(Date);
			expect(hospitalManager.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const hospitalManager = new HospitalManager(mockUser, mockHospital);

			expect(hospitalManager.user).toBeDefined();
			expect(hospitalManager.hospital).toBeDefined();
		});
	});

	describe("Relationships", () => {
		it("should have a user relationship", () => {
			const hospitalManager = new HospitalManager(mockUser, mockHospital);

			expect(hospitalManager.user).toBe(mockUser);
			expect(hospitalManager.user.name).toBe("Test User");
			expect(hospitalManager.user.email).toBe("test@example.com");
		});

		it("should have a hospital relationship", () => {
			const hospitalManager = new HospitalManager(mockUser, mockHospital);

			expect(hospitalManager.hospital).toBe(mockHospital);
			expect(hospitalManager.hospital.name).toBe("Test Hospital");
			expect(hospitalManager.hospital.address).toBe("Test Address");
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const hospitalManager = new HospitalManager(mockUser, mockHospital);

			expect(hospitalManager).toBeInstanceOf(HospitalManager);
		});

		it("should inherit role properties", () => {
			const hospitalManager = new HospitalManager(mockUser, mockHospital);

			expect(hospitalManager.user).toBe(mockUser);
		});
	});
});
