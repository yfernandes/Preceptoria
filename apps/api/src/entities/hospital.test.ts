import { describe, it, expect } from "bun:test";
import { Hospital } from "./hospital.entity";
import { Collection } from "@mikro-orm/postgresql";

describe("Hospital Entity", () => {
	describe("Constructor", () => {
		it("should create a hospital with required fields", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.name).toBe("Test Hospital");
			expect(hospital.address).toBe("Test Address");
			expect(hospital.email).toBe("hospital@test.com");
			expect(hospital.phone).toBe("+5511777777777");
		});

		it("should inherit from Organization", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.id).toBeDefined();
			expect(hospital.createdAt).toBeInstanceOf(Date);
			expect(hospital.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.name).toBeDefined();
			expect(hospital.address).toBeDefined();
			expect(hospital.email).toBeDefined();
			expect(hospital.phone).toBeDefined();
			expect(hospital.manager).toBeDefined();
			expect(hospital.orgAdmin).toBeDefined();
			expect(hospital.shifts).toBeDefined();
		});

		it("should allow property modification", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			hospital.name = "Updated Hospital";
			hospital.address = "456 New Street";

			expect(hospital.name).toBe("Updated Hospital");
			expect(hospital.address).toBe("456 New Street");
		});

		it("should initialize collections", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.manager).toBeDefined();
			expect(hospital.manager).toBeInstanceOf(Collection);
			expect(hospital.manager.length).toBe(0);
			expect(hospital.orgAdmin).toBeDefined();
			expect(hospital.orgAdmin).toBeInstanceOf(Collection);
			expect(hospital.orgAdmin.length).toBe(0);
			expect(hospital.shifts).toBeDefined();
			expect(hospital.shifts).toBeInstanceOf(Collection);
			expect(hospital.shifts.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have manager collection", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.manager).toBeDefined();
			expect(hospital.manager).toBeInstanceOf(Collection);
		});

		it("should have orgAdmin collection", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.orgAdmin).toBeDefined();
			expect(hospital.orgAdmin).toBeInstanceOf(Collection);
		});

		it("should have shifts collection", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.shifts).toBeDefined();
			expect(hospital.shifts).toBeInstanceOf(Collection);
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital).toBeInstanceOf(Hospital);
		});

		it("should inherit organization properties", () => {
			const hospital = new Hospital(
				"Test Hospital",
				"Test Address",
				"hospital@test.com",
				"+5511777777777"
			);

			expect(hospital.name).toBe("Test Hospital");
			expect(hospital.address).toBe("Test Address");
			expect(hospital.email).toBe("hospital@test.com");
			expect(hospital.phone).toBe("+5511777777777");
		});
	});
});
