import { describe, it, expect } from "bun:test";
import { Organization } from "./organization.abstract";

// Create a concrete implementation of Organization for testing
class TestOrganization extends Organization {
	constructor(name: string, address: string, email: string, phone: string) {
		super(name, address, email, phone);
		this.name = name;
		this.address = address;
		this.email = email;
		this.phone = phone;
	}
}

describe("Organization Abstract Class", () => {
	describe("Constructor", () => {
		it("should create an organization with all required fields", () => {
			const org = new TestOrganization(
				"Test School",
				"123 Test Street",
				"test@school.com",
				"+5511999999999"
			);

			expect(org.name).toBe("Test School");
			expect(org.address).toBe("123 Test Street");
			expect(org.email).toBe("test@school.com");
			expect(org.phone).toBe("+5511999999999");
		});

		it("should inherit from BaseEntity", () => {
			const org = new TestOrganization(
				"Test School",
				"123 Test Street",
				"test@school.com",
				"+5511999999999"
			);

			expect(org.id).toBeDefined();
			expect(org.createdAt).toBeInstanceOf(Date);
			expect(org.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const org = new TestOrganization(
				"Test School",
				"123 Test Street",
				"test@school.com",
				"+5511999999999"
			);

			expect(org.name).toBeDefined();
			expect(org.address).toBeDefined();
			expect(org.email).toBeDefined();
			expect(org.phone).toBeDefined();
		});

		it("should allow property modification", () => {
			const org = new TestOrganization(
				"Test School",
				"123 Test Street",
				"test@school.com",
				"+5511999999999"
			);

			org.name = "Updated School";
			org.address = "456 New Street";

			expect(org.name).toBe("Updated School");
			expect(org.address).toBe("456 New Street");
		});
	});

	describe("Validation", () => {
		it("should accept valid email format", () => {
			const org = new TestOrganization(
				"Test School",
				"123 Test Street",
				"valid.email@domain.com",
				"+5511999999999"
			);

			expect(org.email).toBe("valid.email@domain.com");
		});

		it("should accept valid phone number format", () => {
			const org = new TestOrganization(
				"Test School",
				"123 Test Street",
				"test@school.com",
				"+5511999999999"
			);

			expect(org.phone).toBe("+5511999999999");
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const org = new TestOrganization(
				"Test School",
				"123 Test Street",
				"test@school.com",
				"+5511999999999"
			);

			expect(org).toBeInstanceOf(TestOrganization);
			expect(org).toBeInstanceOf(Organization);
		});
	});
});
