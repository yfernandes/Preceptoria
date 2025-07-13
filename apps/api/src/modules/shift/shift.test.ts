import { describe, it, expect, beforeEach } from "bun:test";
import { Shift } from "@api/modules/shift/shift.entity";
import { Collection } from "@mikro-orm/postgresql";
import { Hospital } from "@api/modules/hospital";
import { Preceptor } from "@api/modules/preceptor/preceptor.entity";
import { User } from "@api/modules/users/user.entity";

describe("Shift Entity", () => {
	let mockHospital: Hospital;
	let mockPreceptor: Preceptor;
	let mockUser: User;
	beforeEach(() => {
		// Create simple mock objects to avoid circular dependencies
		mockHospital = new Hospital(
			"Test Hospital",
			"Test Address",
			"hospital@test.com",
			"+5511777777777"
		);

		// Since User's constructor is private, use a mock or a factory method if available.
		// For this test, we'll use a simple mock object.
		mockUser = {
			name: "Test User",
			email: "test@example.com",
			phone: "+5511999999999",
			password: "password123",
		} as unknown as User;

		mockPreceptor = new Preceptor(mockUser, mockHospital);
	});

	describe("Constructor", () => {
		it("should create a shift with required fields", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.date).toBe(date);
			expect(shift.startTime).toBe(startTime);
			expect(shift.endTime).toBe(endTime);
			expect(shift.location).toBe("Emergency Room");
			expect(shift.hospital).toBe(mockHospital);
			expect(shift.preceptor).toBe(mockPreceptor);
		});

		it("should inherit from BaseEntity", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.id).toBeDefined();
			expect(shift.createdAt).toBeInstanceOf(Date);
			expect(shift.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Properties", () => {
		it("should have all required properties", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.date).toBeDefined();
			expect(shift.startTime).toBeDefined();
			expect(shift.endTime).toBeDefined();
			expect(shift.location).toBeDefined();
			expect(shift.hospital).toBeDefined();
			expect(shift.preceptor).toBeDefined();
			expect(shift.students).toBeDefined();
		});

		it("should allow property modification", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			shift.location = "Updated Location";

			expect(shift.location).toBe("Updated Location");
		});

		it("should initialize students collection", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.students).toBeDefined();
			expect(shift.students.length).toBe(0);
		});
	});

	describe("Relationships", () => {
		it("should have a hospital relationship", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.hospital).toBe(mockHospital);
			expect(shift.hospital.name).toBe("Test Hospital");
		});

		it("should have a preceptor relationship", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.preceptor).toBe(mockPreceptor);
			expect(shift.preceptor.user).toBe(mockPreceptor.user);
		});

		it("should have students collection", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.students).toBeDefined();
			expect(shift.students).toBeInstanceOf(Collection);
			expect(shift.students.length).toBe(0);
		});
	});

	describe("Time Management", () => {
		it("should handle valid time ranges", () => {
			const date = new Date("2024-01-01");
			const startTime = new Date("2024-01-01T08:00:00Z");
			const endTime = new Date("2024-01-01T16:00:00Z");

			const shift = new Shift(
				date,
				startTime,
				endTime,
				"Emergency Room",
				mockHospital,
				mockPreceptor
			);

			expect(shift.startTime.getTime()).toBeLessThan(shift.endTime.getTime());
		});
	});
});
