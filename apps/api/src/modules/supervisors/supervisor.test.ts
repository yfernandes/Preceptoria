import { describe, it, expect, beforeEach } from "bun:test";
import { Supervisor } from "./supervisor.entity";
import { User } from "../users/user.entity";
import { School } from "../schools/school.entity";
import { Collection } from "@mikro-orm/postgresql";

describe("Supervisor Entity", () => {
	let mockUser: User;
	let mockSchool: School;

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
	});

	describe("Constructor", () => {
		it("should create a supervisor with required fields", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.user).toBe(mockUser);
			expect(supervisor.school).toBe(mockSchool);
		});

		it("should inherit from Role", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.id).toBeDefined();
			expect(supervisor.createdAt).toBeInstanceOf(Date);
			expect(supervisor.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.user).toBeDefined();
			expect(supervisor.school).toBeDefined();
			expect(supervisor.courses).toBeDefined();
		});

		it("should initialize collections", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.courses).toBeDefined();
			expect(supervisor.courses).toBeInstanceOf(Collection);
			expect(supervisor.courses.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have a user relationship", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.user).toBe(mockUser);
			expect(supervisor.user.name).toBe("Test User");
			expect(supervisor.user.email).toBe("test@example.com");
		});

		it("should have a school relationship", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.school).toBe(mockSchool);
			expect(supervisor.school.name).toBe("Test School");
			expect(supervisor.school.address).toBe("Test Address");
		});

		it("should have courses collection", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.courses).toBeDefined();
			expect(supervisor.courses).toBeInstanceOf(Collection);
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor).toBeInstanceOf(Supervisor);
		});

		it("should inherit role properties", () => {
			const supervisor = new Supervisor(mockUser, mockSchool);

			expect(supervisor.user).toBe(mockUser);
		});
	});
});
