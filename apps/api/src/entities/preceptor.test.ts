import { describe, it, expect, beforeEach } from "bun:test";
import { Preceptor } from "@api/modules/preceptor/preceptor.entity";
import { User } from "@api/modules/user/user.entity";
import { Hospital } from "@api/modules/hospital";
import { Collection } from "@mikro-orm/postgresql";

describe("Preceptor Entity", () => {
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
		it("should create a preceptor with required fields", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.user).toBe(mockUser);
			expect(preceptor.hospital).toBe(mockHospital);
		});

		it("should inherit from Role", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.id).toBeDefined();
			expect(preceptor.createdAt).toBeInstanceOf(Date);
			expect(preceptor.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.user).toBeDefined();
			expect(preceptor.hospital).toBeDefined();
			expect(preceptor.shifts).toBeDefined();
		});

		it("should initialize collections", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.shifts).toBeDefined();
			expect(preceptor.shifts).toBeInstanceOf(Collection);
			expect(preceptor.shifts.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have a user relationship", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.user).toBe(mockUser);
			expect(preceptor.user.name).toBe("Test User");
			expect(preceptor.user.email).toBe("test@example.com");
		});

		it("should have a hospital relationship", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.hospital).toBe(mockHospital);
			expect(preceptor.hospital.name).toBe("Test Hospital");
			expect(preceptor.hospital.address).toBe("Test Address");
		});

		it("should have shifts collection", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.shifts).toBeDefined();
			expect(preceptor.shifts).toBeInstanceOf(Collection);
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor).toBeInstanceOf(Preceptor);
		});

		it("should inherit role properties", () => {
			const preceptor = new Preceptor(mockUser, mockHospital);

			expect(preceptor.user).toBe(mockUser);
		});
	});
});
