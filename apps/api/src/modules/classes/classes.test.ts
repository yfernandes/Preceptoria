import { describe, it, expect, beforeEach } from "bun:test";
import { Collection } from "@mikro-orm/postgresql";

import { Classes } from "@api/modules/classes/classes.entity";
import { Course } from "@api/modules/courses/course.entity";
import { School } from "@api/modules/school/school.entity";
import { Supervisor } from "@api/modules/supervisor/supervisor.entity";
import { User } from "@api/modules/users/user.entity";

describe("Classes Entity", () => {
	let mockSchool: School;
	let mockSupervisor: Supervisor;
	let mockUser: User;
	let mockCourse: Course;

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
		mockCourse = new Course("Test Course", mockSchool, mockSupervisor);
	});

	describe("Constructor", () => {
		it("should create a class with required fields", () => {
			const classes = new Classes("Test Class", mockCourse);

			expect(classes.name).toBe("Test Class");
			expect(classes.course).toBe(mockCourse);
		});

		it("should inherit from BaseEntity", () => {
			const classes = new Classes("Test Class", mockCourse);

			expect(classes.id).toBeDefined();
			expect(classes.createdAt).toBeInstanceOf(Date);
			expect(classes.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const classes = new Classes("Test Class", mockCourse);

			expect(classes.name).toBeDefined();
			expect(classes.course).toBeDefined();
			expect(classes.students).toBeDefined();
		});

		it("should allow property modification", () => {
			const classes = new Classes("Test Class", mockCourse);

			classes.name = "Updated Class";

			expect(classes.name).toBe("Updated Class");
		});

		it("should initialize students collection", () => {
			const classes = new Classes("Test Class", mockCourse);

			expect(classes.students).toBeDefined();
			expect(classes.students).toBeInstanceOf(Collection);
			expect(classes.students.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have a course relationship", () => {
			const classes = new Classes("Test Class", mockCourse);

			expect(classes.course).toBe(mockCourse);
			expect(classes.course.name).toBe("Test Course");
		});

		it("should have a students collection", () => {
			const classes = new Classes("Test Class", mockCourse);

			expect(classes.students).toBeDefined();
			expect(classes.students).toBeInstanceOf(Collection);
		});
	});

	describe("Course Relationship", () => {
		it("should maintain reference to the course", () => {
			const classes = new Classes("Test Class", mockCourse);

			expect(classes.course).toBe(mockCourse);
			expect(classes.course.school).toBe(mockSchool);
			expect(classes.course.supervisor).toBe(mockSupervisor);
		});
	});
});
