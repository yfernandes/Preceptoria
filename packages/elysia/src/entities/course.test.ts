import { describe, it, expect, beforeEach } from "bun:test";
import { Course } from "./course.entity";
import { School } from "./school.entity";
import { Supervisor } from "./supervisor.entity";
import { User } from "./user.entity";
import { Collection } from "@mikro-orm/postgresql";

describe("Course Entity", () => {
	let mockSchool: School;
	let mockSupervisor: Supervisor;
	let mockUser: User;

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
		mockSupervisor = new Supervisor(mockUser, mockSchool);
	});

	describe("Constructor", () => {
		it("should create a course with required fields", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.name).toBe("Test Course");
			expect(course.school).toBe(mockSchool);
			expect(course.supervisor).toBe(mockSupervisor);
		});

		it("should inherit from BaseEntity", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.id).toBeDefined();
			expect(course.createdAt).toBeInstanceOf(Date);
			expect(course.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.name).toBeDefined();
			expect(course.school).toBeDefined();
			expect(course.supervisor).toBeDefined();
			expect(course.classes).toBeDefined();
		});

		it("should allow property modification", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			course.name = "Updated Course";

			expect(course.name).toBe("Updated Course");
		});

		it("should initialize classes collection", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.classes).toBeDefined();
			expect(course.classes).toBeInstanceOf(Collection);
			expect(course.classes.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have a school relationship", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.school).toBe(mockSchool);
			expect(course.school.name).toBe("Test School");
		});

		it("should have a supervisor relationship", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.supervisor).toBe(mockSupervisor);
			expect(course.supervisor.user).toBe(mockUser);
		});

		it("should have a classes collection", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.classes).toBeDefined();
			expect(course.classes).toBeInstanceOf(Collection);
		});
	});

	describe("School Relationship", () => {
		it("should maintain reference to the school", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.school).toBe(mockSchool);
			expect(course.school.name).toBe("Test School");
			expect(course.school.address).toBe("Test Address");
			expect(course.school.email).toBe("school@test.com");
		});
	});

	describe("Supervisor Relationship", () => {
		it("should maintain reference to the supervisor", () => {
			const course = new Course("Test Course", mockSchool, mockSupervisor);

			expect(course.supervisor).toBe(mockSupervisor);
			expect(course.supervisor.user).toBe(mockUser);
			expect(course.supervisor.school).toBe(mockSchool);
		});
	});
});
