import { describe, it, expect } from "bun:test";
import { Collection } from "@mikro-orm/postgresql";
import { School } from "./school.entity";

describe("School Entity", () => {
	describe("Constructor", () => {
		it("should create a school with required fields", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.name).toBe("Test School");
			expect(school.address).toBe("Test Address");
			expect(school.email).toBe("school@test.com");
			expect(school.phone).toBe("+5511888888888");
		});

		it("should inherit from Organization", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.id).toBeDefined();
			expect(school.createdAt).toBeInstanceOf(Date);
			expect(school.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.name).toBeDefined();
			expect(school.address).toBeDefined();
			expect(school.email).toBeDefined();
			expect(school.phone).toBeDefined();
			expect(school.orgAdmin).toBeDefined();
			expect(school.courses).toBeDefined();
			expect(school.supervisors).toBeDefined();
		});

		it("should allow property modification", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			school.name = "Updated School";
			school.address = "456 New Street";

			expect(school.name).toBe("Updated School");
			expect(school.address).toBe("456 New Street");
		});

		it("should initialize collections", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.orgAdmin).toBeDefined();
			expect(school.orgAdmin).toBeInstanceOf(Collection);
			expect(school.orgAdmin.length).toBe(0);
			expect(school.courses).toBeDefined();
			expect(school.courses).toBeInstanceOf(Collection);
			expect(school.courses.length).toBe(0);
			expect(school.supervisors).toBeDefined();
			expect(school.supervisors).toBeInstanceOf(Collection);
			expect(school.supervisors.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have orgAdmin collection", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.orgAdmin).toBeDefined();
			expect(school.orgAdmin).toBeInstanceOf(Collection);
		});

		it("should have courses collection", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.courses).toBeDefined();
			expect(school.courses).toBeInstanceOf(Collection);
		});

		it("should have supervisors collection", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.supervisors).toBeDefined();
			expect(school.supervisors).toBeInstanceOf(Collection);
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school).toBeInstanceOf(School);
		});

		it("should inherit organization properties", () => {
			const school = new School(
				"Test School",
				"Test Address",
				"school@test.com",
				"+5511888888888"
			);

			expect(school.name).toBe("Test School");
			expect(school.address).toBe("Test Address");
			expect(school.email).toBe("school@test.com");
			expect(school.phone).toBe("+5511888888888");
		});
	});
});
