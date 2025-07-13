import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { hasPermission } from "./hasPermissions";
import { Resource, Actions } from "./permissions";
import { UserRoles } from "../entities/role.abstract";
import { UserContext } from "../types/jwtCookie";

// Mock the database module before importing hasPermissions
const mockDb = {
	student: {
		findOne: mock<() => Promise<unknown>>(() => Promise.resolve(null)),
	},
	shift: {
		findOne: mock<() => Promise<unknown>>(() => Promise.resolve(null)),
	},
	hospital: {
		findOne: mock<() => Promise<unknown>>(() => Promise.resolve(null)),
	},
	classes: {
		findOne: mock<() => Promise<unknown>>(() => Promise.resolve(null)),
	},
	document: {
		findOne: mock<() => Promise<unknown>>(() => Promise.resolve(null)),
	},
};

// Mock the db module
await mock.module("../db", () => ({
	db: mockDb,
}));

describe.todo("hasPermission", () => {
	beforeEach(() => {
		// Reset all mocks before each test
		mockDb.student.findOne.mockClear();
		mockDb.shift.findOne.mockClear();
		mockDb.hospital.findOne.mockClear();
		mockDb.classes.findOne.mockClear();
		mockDb.document.findOne.mockClear();
	});

	afterEach(() => {
		// Clean up after each test
		mock.restore();
	});

	describe.todo("SysAdmin permissions", () => {
		it("should always return true for SysAdmin", async () => {
			const requester: UserContext = {
				id: "sys-admin-1",
				roles: [UserRoles.SysAdmin],
				sysAdminId: "sys-admin-1",
			};

			const result = await hasPermission(
				requester,
				Resource.Student,
				Actions.Read,
				"any-resource-id"
			);

			expect(result).toBe(true);
		});
	});

	describe.todo("OrgAdmin permissions", () => {
		const orgAdminRequester: UserContext = {
			id: "org-admin-1",
			roles: [UserRoles.OrgAdmin],
			orgAdminId: "org-admin-1",
		};

		it("should return true for Document:Read_Managed", async () => {
			const result = await hasPermission(
				orgAdminRequester,
				Resource.Document,
				Actions.Read,
				"document-1"
			);

			expect(result).toBe(true);
		});

		it("should return true for Student:Read_Managed", async () => {
			const result = await hasPermission(
				orgAdminRequester,
				Resource.Student,
				Actions.Read,
				"student-1"
			);

			expect(result).toBe(true);
		});

		it("should return true for Hospital:Read_Managed", async () => {
			const result = await hasPermission(
				orgAdminRequester,
				Resource.Hospital,
				Actions.Read,
				"hospital-1"
			);

			expect(result).toBe(true);
		});

		it("should return true for School:Read_Managed", async () => {
			const result = await hasPermission(
				orgAdminRequester,
				Resource.School,
				Actions.Read,
				"school-1"
			);

			expect(result).toBe(true);
		});

		it("should return true for Course:Read_Managed", async () => {
			const result = await hasPermission(
				orgAdminRequester,
				Resource.Course,
				Actions.Read,
				"course-1"
			);

			expect(result).toBe(true);
		});

		it("should return true for Classes:Read_Managed", async () => {
			const result = await hasPermission(
				orgAdminRequester,
				Resource.Classes,
				Actions.Read,
				"class-1"
			);

			expect(result).toBe(true);
		});

		it("should return false for unauthorized resource", async () => {
			const result = await hasPermission(
				orgAdminRequester,
				Resource.Shift,
				Actions.Read,
				"shift-1"
			);

			expect(result).toBe(false);
		});
	});

	describe.todo("HospitalManager permissions", () => {
		const hospitalManagerRequester: UserContext = {
			id: "hospital-manager-1",
			roles: [UserRoles.HospitalManager],
			hospitalManagerId: "hospital-manager-1",
		};

		describe.todo("Student:Read_Own", () => {
			it("should return true when student has shifts in manager's hospital", async () => {
				const mockStudent = {
					id: "student-1",
					shifts: {
						exists: mock(() => true),
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					hospitalManagerRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(true);
				expect(mockDb.student.findOne).toHaveBeenCalledWith({
					id: "student-1",
				});
			});

			it("should return false when student has no shifts in manager's hospital", async () => {
				const mockStudent = {
					id: "student-1",
					shifts: {
						exists: mock(() => false),
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					hospitalManagerRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(false);
			});

			it("should return false when student not found", async () => {
				mockDb.student.findOne.mockResolvedValue(null);

				const result = await hasPermission(
					hospitalManagerRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(false);
			});

			it("should return false on database error", async () => {
				mockDb.student.findOne.mockRejectedValue(new Error("Database error"));

				const result = await hasPermission(
					hospitalManagerRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Shift:Read_Own", () => {
			it("should return true when shift belongs to manager's hospital", async () => {
				const mockShift = {
					id: "shift-1",
					hospital: {
						manager: {
							exists: mock(() => true),
						},
					},
				};

				mockDb.shift.findOne.mockResolvedValue(mockShift);

				const result = await hasPermission(
					hospitalManagerRequester,
					Resource.Shift,
					Actions.Read,
					"shift-1"
				);

				expect(result).toBe(true);
				expect(mockDb.shift.findOne).toHaveBeenCalledWith({ id: "shift-1" });
			});

			it("should return false when shift doesn't belong to manager's hospital", async () => {
				const mockShift = {
					id: "shift-1",
					hospital: {
						manager: {
							exists: mock(() => false),
						},
					},
				};

				mockDb.shift.findOne.mockResolvedValue(mockShift);

				const result = await hasPermission(
					hospitalManagerRequester,
					Resource.Shift,
					Actions.Read,
					"shift-1"
				);

				expect(result).toBe(false);
			});
		});

		it("should return true for Document:Read_Managed", async () => {
			const result = await hasPermission(
				hospitalManagerRequester,
				Resource.Document,
				Actions.Read,
				"document-1"
			);

			expect(result).toBe(true);
		});

		it("should return true for Classes:Read_Managed", async () => {
			const result = await hasPermission(
				hospitalManagerRequester,
				Resource.Classes,
				Actions.Read,
				"class-1"
			);

			expect(result).toBe(true);
		});
	});

	describe.todo("Preceptor permissions", () => {
		const preceptorRequester: UserContext = {
			id: "preceptor-1",
			roles: [UserRoles.Preceptor],
			preceptorId: "preceptor-1",
		};

		describe.todo("Student:Read_Own", () => {
			it("should return true when student has shifts with this preceptor", async () => {
				const mockStudent = {
					id: "student-1",
					shifts: {
						exists: mock(() => true),
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					preceptorRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when student has no shifts with this preceptor", async () => {
				const mockStudent = {
					id: "student-1",
					shifts: {
						exists: mock(() => false),
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					preceptorRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Shift:Read_Own", () => {
			it("should return true when shift belongs to this preceptor", async () => {
				const mockShift = {
					id: "shift-1",
					preceptor: {
						id: "preceptor-1",
					},
				};

				mockDb.shift.findOne.mockResolvedValue(mockShift);

				const result = await hasPermission(
					preceptorRequester,
					Resource.Shift,
					Actions.Read,
					"shift-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when shift doesn't belong to this preceptor", async () => {
				const mockShift = {
					id: "shift-1",
					preceptor: {
						id: "preceptor-2",
					},
				};

				mockDb.shift.findOne.mockResolvedValue(mockShift);

				const result = await hasPermission(
					preceptorRequester,
					Resource.Shift,
					Actions.Read,
					"shift-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Hospital:Read_Own", () => {
			it("should return true when hospital has shifts with this preceptor", async () => {
				const mockHospital = {
					id: "hospital-1",
					shifts: {
						exists: mock(() => true),
					},
				};

				mockDb.hospital.findOne.mockResolvedValue(mockHospital);

				const result = await hasPermission(
					preceptorRequester,
					Resource.Hospital,
					Actions.Read,
					"hospital-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when hospital has no shifts with this preceptor", async () => {
				const mockHospital = {
					id: "hospital-1",
					shifts: {
						exists: mock(() => false),
					},
				};

				mockDb.hospital.findOne.mockResolvedValue(mockHospital);

				const result = await hasPermission(
					preceptorRequester,
					Resource.Hospital,
					Actions.Read,
					"hospital-1"
				);

				expect(result).toBe(false);
			});
		});
	});

	describe.todo("Student permissions", () => {
		const studentRequester: UserContext = {
			id: "student-1",
			roles: [UserRoles.Student],
			studentId: "student-1",
		};

		describe.todo("Document:Read_Own", () => {
			it("should return true when document belongs to this student", async () => {
				const mockDocument = {
					id: "document-1",
					student: {
						id: "student-1",
					},
				};

				mockDb.document.findOne.mockResolvedValue(mockDocument);

				const result = await hasPermission(
					studentRequester,
					Resource.Document,
					Actions.Read,
					"document-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when document doesn't belong to this student", async () => {
				const mockDocument = {
					id: "document-1",
					student: {
						id: "student-2",
					},
				};

				mockDb.document.findOne.mockResolvedValue(mockDocument);

				const result = await hasPermission(
					studentRequester,
					Resource.Document,
					Actions.Read,
					"document-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Classes:Read_Own", () => {
			it("should return true when student is in this class", async () => {
				const mockStudent = {
					id: "student-1",
					class: {
						id: "class-1",
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					studentRequester,
					Resource.Classes,
					Actions.Read,
					"class-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when student is not in this class", async () => {
				const mockStudent = {
					id: "student-1",
					class: {
						id: "class-2",
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					studentRequester,
					Resource.Classes,
					Actions.Read,
					"class-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Shift:Read_Own", () => {
			it("should return true when student is in this shift", async () => {
				const mockStudent = {
					id: "student-1",
					shifts: {
						exists: mock(() => true),
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					studentRequester,
					Resource.Shift,
					Actions.Read,
					"shift-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when student is not in this shift", async () => {
				const mockStudent = {
					id: "student-1",
					shifts: {
						exists: mock(() => false),
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					studentRequester,
					Resource.Shift,
					Actions.Read,
					"shift-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Student:Read_Own", () => {
			it("should return true when accessing own student record", async () => {
				const result = await hasPermission(
					studentRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when accessing other student record", async () => {
				const result = await hasPermission(
					studentRequester,
					Resource.Student,
					Actions.Read,
					"student-2"
				);

				expect(result).toBe(false);
			});
		});
	});

	describe.todo("Supervisor permissions", () => {
		const supervisorRequester: UserContext = {
			id: "supervisor-1",
			roles: [UserRoles.Supervisor],
			supervisorId: "supervisor-1",
		};

		describe.todo("Student:Read_Own", () => {
			it("should return true when student is in supervisor's course", async () => {
				const mockStudent = {
					id: "student-1",
					class: {
						course: {
							supervisor: {
								id: "supervisor-1",
							},
						},
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					supervisorRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when student is not in supervisor's course", async () => {
				const mockStudent = {
					id: "student-1",
					class: {
						course: {
							supervisor: {
								id: "supervisor-2",
							},
						},
					},
				};

				mockDb.student.findOne.mockResolvedValue(mockStudent);

				const result = await hasPermission(
					supervisorRequester,
					Resource.Student,
					Actions.Read,
					"student-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Classes:Read_Own", () => {
			it("should return true when class is in supervisor's course", async () => {
				const mockClass = {
					id: "class-1",
					course: {
						supervisor: {
							id: "supervisor-1",
						},
					},
				};

				mockDb.classes.findOne.mockResolvedValue(mockClass);

				const result = await hasPermission(
					supervisorRequester,
					Resource.Classes,
					Actions.Read,
					"class-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when class is not in supervisor's course", async () => {
				const mockClass = {
					id: "class-1",
					course: {
						supervisor: {
							id: "supervisor-2",
						},
					},
				};

				mockDb.classes.findOne.mockResolvedValue(mockClass);

				const result = await hasPermission(
					supervisorRequester,
					Resource.Classes,
					Actions.Read,
					"class-1"
				);

				expect(result).toBe(false);
			});
		});

		describe.todo("Document:Students", () => {
			it("should return true when document belongs to student in supervisor's course", async () => {
				const mockDocument = {
					id: "document-1",
					student: {
						class: {
							course: {
								supervisor: {
									id: "supervisor-1",
								},
							},
						},
					},
				};

				mockDb.document.findOne.mockResolvedValue(mockDocument);

				const result = await hasPermission(
					supervisorRequester,
					Resource.Document,
					Actions.Read,
					"document-1"
				);

				expect(result).toBe(true);
			});

			it("should return false when document belongs to student not in supervisor's course", async () => {
				const mockDocument = {
					id: "document-1",
					student: {
						class: {
							course: {
								supervisor: {
									id: "supervisor-2",
								},
							},
						},
					},
				};

				mockDb.document.findOne.mockResolvedValue(mockDocument);

				const result = await hasPermission(
					supervisorRequester,
					Resource.Document,
					Actions.Read,
					"document-1"
				);

				expect(result).toBe(false);
			});
		});
	});

	describe.todo("Multiple roles", () => {
		it("should return true if any role has permission", async () => {
			const multiRoleRequester: UserContext = {
				id: "user-1",
				roles: [UserRoles.Student, UserRoles.Preceptor],
				studentId: "student-1",
				preceptorId: "preceptor-1",
			};

			const mockStudent = {
				id: "student-1",
				shifts: {
					exists: mock(() => true),
				},
			};

			mockDb.student.findOne.mockResolvedValue(mockStudent);

			const result = await hasPermission(
				multiRoleRequester,
				Resource.Student,
				Actions.Read,
				"student-1"
			);

			expect(result).toBe(true);
		});

		it("should return false if no role has permission", async () => {
			const multiRoleRequester: UserContext = {
				id: "user-1",
				roles: [UserRoles.Student, UserRoles.Preceptor],
				studentId: "student-1",
				preceptorId: "preceptor-1",
			};

			const mockStudent = {
				id: "student-1",
				shifts: {
					exists: mock(() => false),
				},
			};

			mockDb.student.findOne.mockResolvedValue(mockStudent);

			const result = await hasPermission(
				multiRoleRequester,
				Resource.Student,
				Actions.Read,
				"student-2" // Different student ID
			);

			expect(result).toBe(false);
		});
	});

	describe.todo("Edge cases", () => {
		it("should return false for unknown role", async () => {
			const unknownRoleRequester: UserContext = {
				id: "user-1",
				roles: ["UnknownRole" as UserRoles],
			};

			const result = await hasPermission(
				unknownRoleRequester,
				Resource.Student,
				Actions.Read,
				"student-1"
			);

			expect(result).toBe(false);
		});

		it("should return false for unknown resource", async () => {
			const requester: UserContext = {
				id: "student-1",
				roles: [UserRoles.Student],
				studentId: "student-1",
			};

			const result = await hasPermission(
				requester,
				"UnknownResource" as Resource,
				Actions.Read,
				"resource-1"
			);

			expect(result).toBe(false);
		});

		it("should handle empty roles array", async () => {
			const emptyRolesRequester: UserContext = {
				id: "user-1",
				roles: [],
			};

			const result = await hasPermission(
				emptyRolesRequester,
				Resource.Student,
				Actions.Read,
				"student-1"
			);

			expect(result).toBe(false);
		});
	});
});
