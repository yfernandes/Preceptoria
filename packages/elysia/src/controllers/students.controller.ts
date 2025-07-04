import Elysia, { t } from "elysia";
import { Student } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

const createStudentDto = {
	body: t.Object({
		userId: t.String(),
		classId: t.String(),
	}),
};

const updateStudentDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		email: t.Optional(t.String()),
		phoneNumber: t.Optional(t.String()),
		classId: t.Optional(t.String()),
	}),
};

export const studentsController = new Elysia({ prefix: "students" })
	.use(authMiddleware)
	.post(
		"/",
		async ({ body: { userId, classId }, requester, status }) => {
			// Check if requester has permission to create students
			if (
				!(await hasPermission(
					requester,
					Resource.Student,
					Actions.Create,
					"*" // For creation, we use "*" as resourceId
				))
			) {
				status(403);
				return { message: "You do not have permission to create students." };
			}

			const user = await db.user.findOne({ id: userId });
			if (!user) {
				status(404);
				return { message: "User not found!" };
			}

			const classes = await db.classes.findOne({ id: classId });
			if (!classes) {
				status(404);
				return { message: "Class not found!" };
			}

			// Check if user is already a student
			const existingStudent = await db.student.findOne({ user: { id: userId } });
			if (existingStudent) {
				status(409);
				return { message: "User is already a student!" };
			}

			try {
				const student = new Student(user, classes);
				await db.em.persistAndFlush(student);
				return student;
			} catch (error) {
				status(500);
				return { message: "Failed to create student", error: error instanceof Error ? error.message : "Unknown error" };
			}
		},
		createStudentDto
	)
	.get("/", async ({ requester, status }) => {
		// Check if requester has permission to read students
		if (
			!(await hasPermission(
				requester,
				Resource.Student,
				Actions.Read,
				"*" // For listing, we use "*" as resourceId
			))
		) {
			status(403);
			return { message: "You do not have permission to access student data." };
		}

		try {
			if (requester.sysAdminId) {
				// Full access
				return await db.student.findAll({
					populate: ["user", "class", "shifts"],
				});
			}

			if (requester.supervisorId) {
				// Supervisors can access students under their classes
				return await db.student.findAll({
					where: {
						class: {
							course: {
								supervisor: {
									id: requester.supervisorId,
								},
							},
						},
					},
					populate: ["user", "class", "shifts"],
				});
			}

			if (requester.preceptorId) {
				// Preceptors can access students in their shifts
				return await db.student.findAll({
					where: {
						shifts: {
							preceptor: {
								id: requester.preceptorId,
							},
						},
					},
					populate: ["user", "class", "shifts"],
				});
			}

			if (requester.hospitalManagerId) {
				// Hospital managers can access students in their hospital's shifts
				return await db.student.findAll({
					where: {
						shifts: {
							hospital: {
								manager: {
									id: requester.hospitalManagerId,
								},
							},
						},
					},
					populate: ["user", "class", "shifts"],
				});
			}

			if (requester.studentId) {
				// Students can only access themselves
				return await db.student.findOne(
					{ id: requester.studentId },
					{ populate: ["user", "class", "shifts"] }
				);
			}

			status(403);
			return { message: "You do not have permission to access student data." };
		} catch (error) {
			status(500);
			return { message: "Failed to fetch students", error: error instanceof Error ? error.message : "Unknown error" };
		}
	})
	.get("/:id", async ({ requester, status, params: { id: studentId } }) => {
		if (
			!(await hasPermission(
				requester,
				Resource.Student,
				Actions.Read,
				studentId
			))
		) {
			status(403);
			return { message: "You do not have permission to access this student." };
		}

		try {
			const student = await db.student.findOne(
				{ id: studentId },
				{ populate: ["user", "class", "shifts", "documents"] }
			);
			
			if (!student) {
				status(404);
				return { message: "Student not found" };
			}

			return student;
		} catch (error) {
			status(500);
			return { message: "Failed to fetch student", error: error instanceof Error ? error.message : "Unknown error" };
		}
	})
	.patch(
		"/:id",
		async ({ requester, status, params: { id: studentId }, body }) => {
			if (
				!(await hasPermission(
					requester,
					Resource.Student,
					Actions.Update,
					studentId
				))
			) {
				status(403);
				return { message: "You do not have permission to update this student." };
			}

			try {
				const student = await db.student.findOne(
					{ id: studentId },
					{ populate: ["user", "class"] }
				);
				
				if (!student) {
					status(404);
					return { message: "Student not found" };
				}

				// Update user information if provided
				if (body.name !== undefined) {
					student.user.name = body.name;
				}
				if (body.email !== undefined) {
					student.user.email = body.email;
				}
				if (body.phoneNumber !== undefined) {
					student.user.phoneNumber = body.phoneNumber;
				}

				// Update class if provided and requester has permission
				if (body.classId !== undefined) {
					const newClass = await db.classes.findOne({ id: body.classId });
					if (!newClass) {
						status(404);
						return { message: "Class not found" };
					}
					student.class = newClass;
				}

				await db.em.flush();
				return student;
			} catch (error) {
				status(500);
				return { message: "Failed to update student", error: error instanceof Error ? error.message : "Unknown error" };
			}
		},
		updateStudentDto
	)
	.delete("/:id", async ({ requester, status, params: { id: studentId } }) => {
		if (
			!(await hasPermission(
				requester,
				Resource.Student,
				Actions.Delete,
				studentId
			))
		) {
			status(403);
			return { message: "You do not have permission to delete this student." };
		}

		try {
			const student = await db.student.findOne({ id: studentId });
			
			if (!student) {
				status(404);
				return { message: "Student not found" };
			}

			await db.em.removeAndFlush(student);
			return { message: "Student deleted successfully" };
		} catch (error) {
			status(500);
			return { message: "Failed to delete student", error: error instanceof Error ? error.message : "Unknown error" };
		}
	});
