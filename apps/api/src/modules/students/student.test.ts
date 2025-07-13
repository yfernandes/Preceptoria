import { describe, it, expect, beforeEach } from "bun:test";
import { Student } from "@api/modules/students/student.entity";
import { User } from "@api/entities/user.entity";
import { Classes } from "@api/modules/classes";
import { Course } from "@api/modules/courses/course.entity";
import { School } from "@api/modules/school/school.entity";
import { Supervisor } from "@api/entities/supervisor.entity";
import { Collection } from "@mikro-orm/postgresql";

describe("Student Entity", () => {
	let mockUser: User;
	let mockSchool: School;
	let mockSupervisor: Supervisor;
	let mockCourse: Course;
	let mockClasses: Classes;

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
		mockClasses = new Classes("Test Class", mockCourse);
	});

	describe("Constructor", () => {
		it("should create a student with required fields", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.user).toBe(mockUser);
			expect(student.class).toBe(mockClasses);
		});

		it("should inherit from Role", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.id).toBeDefined();
			expect(student.createdAt).toBeInstanceOf(Date);
			expect(student.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.user).toBeDefined();
			expect(student.class).toBeDefined();
			expect(student.documents).toBeDefined();
			expect(student.shifts).toBeDefined();
		});

		it("should initialize collections", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.documents).toBeDefined();
			expect(student.documents).toBeInstanceOf(Collection);
			expect(student.documents.length).toBe(0);
			expect(student.shifts).toBeDefined();
			expect(student.shifts).toBeInstanceOf(Collection);
			expect(student.shifts.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have a user relationship", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.user).toBe(mockUser);
			expect(student.user.name).toBe("Test User");
			expect(student.user.email).toBe("test@example.com");
		});

		it("should have a class relationship", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.class).toBe(mockClasses);
			expect(student.class.name).toBe("Test Class");
			expect(student.class.course).toBe(mockCourse);
		});

		it("should have documents collection", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.documents).toBeDefined();
			expect(student.documents).toBeInstanceOf(Collection);
		});

		it("should have shifts collection", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.shifts).toBeDefined();
			expect(student.shifts).toBeInstanceOf(Collection);
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student).toBeInstanceOf(Student);
		});

		it("should inherit role properties", () => {
			const student = new Student(mockUser, mockClasses);

			expect(student.user).toBe(mockUser);
		});
	});
});
