import { FilterQuery } from "@mikro-orm/postgresql";
import Elysia, { status as error, t } from "elysia";
import { Student } from "../entities";
import { db } from "../db";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";
import { UserRoles } from "../entities/role.abstract";
import { authenticatedUserMiddleware } from "@api/middlewares/authenticatedUser.middleware";

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
	.use(authenticatedUserMiddleware)
	.post(
		"/",
		async ({ body: { userId, classId }, requester }) => {
			try {
				// Check if requester has permission to create students in this class
				const hasAccess = await hasPermission(
					requester,
					Resource.Student,
					Actions.Create,
					classId // Using classId as the resource context
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"Access denied. You don't have permission to create students in this class.",
					});
				}

				const user = await db.user.findOne({ id: userId });
				if (!user) {
					return error(404, { success: false, message: "User not found" });
				}

				const classes = await db.classes.findOne({ id: classId });
				if (!classes) {
					return error(404, { success: false, message: "Class not found" });
				}

				// Check if user is already a student
				const existingStudent = await db.student.findOne({
					user: { id: userId },
				});
				if (existingStudent) {
					return error(409, {
						success: false,
						message: "User is already a student",
					});
				}

				const student = new Student(user, classes);
				await db.em.persistAndFlush(student);

				return {
					success: true,
					message: "Student created successfully",
					data: student,
				};
			} catch (err) {
				console.error("Error creating student:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createStudentDto
	)
	.get("/", async ({ requester, query }) => {
		try {
			const { classId, supervisorId, limit = 10, offset = 0 } = query;

			// Build filter based on user permissions and role
			const filter: FilterQuery<Student> = {};

			// Apply query filters
			if (classId) {
				filter.class = { id: classId };
			}

			if (supervisorId) {
				filter.class = Object.assign(
					{},
					typeof filter.class === "object" && !Array.isArray(filter.class)
						? filter.class
						: {},
					{ course: { supervisor: { id: supervisorId } } }
				);
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see themselves
				filter.id = requester.id;
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see students in their classes
				// This will be handled by the permission system in the query
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see students with shifts at their hospital
				// This requires complex filtering based on shift assignments
			} else if (requester.roles.includes(UserRoles.Preceptor)) {
				// Preceptors can see students in their assigned shifts
				// This requires complex filtering based on shift assignments
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all students within their organization
				// This requires filtering by organization
			}

			// Get students with pagination
			const students = await db.student.find(filter, {
				populate: ["user", "class", "shifts"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: "DESC" },
			});

			// Filter students based on permissions
			const accessibleStudents = [];
			for (const student of students) {
				const hasAccess = await hasPermission(
					requester,
					Resource.Student,
					Actions.Read,
					student.id
				);

				if (hasAccess) {
					accessibleStudents.push(student);
				}
			}

			return {
				success: true,
				data: accessibleStudents,
				pagination: {
					total: accessibleStudents.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleStudents.length === parseInt(limit as string),
				},
			};
		} catch (err) {
			console.error("Error fetching students:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	.get("/:id", async ({ requester, params: { id: studentId } }) => {
		try {
			const student = await db.student.findOne(
				{ id: studentId },
				{ populate: ["user", "class", "shifts", "documents"] }
			);

			if (!student) {
				return error(404, { success: false, message: "Student not found" });
			}

			// Check permissions using our comprehensive permission system
			const hasAccess = await hasPermission(
				requester,
				Resource.Student,
				Actions.Read,
				studentId
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message:
						"Access denied. You don't have permission to view this student.",
				});
			}

			return {
				success: true,
				data: student,
			};
		} catch (err) {
			console.error("Error fetching student:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	.patch(
		"/:id",
		async ({ requester, params: { id: studentId }, body }) => {
			try {
				// Check permissions - Supervisors can update students in their classes
				const hasAccess = await hasPermission(
					requester,
					Resource.Student,
					Actions.Update,
					studentId
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"Access denied. You don't have permission to update this student.",
					});
				}

				const student = await db.student.findOne(
					{ id: studentId },
					{ populate: ["user", "class"] }
				);

				if (!student) {
					return error(404, { success: false, message: "Student not found" });
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
						return error(404, { success: false, message: "Class not found" });
					}

					// Check if user has permission to move student to this class
					const canMoveToClass = await hasPermission(
						requester,
						Resource.Student,
						Actions.Update,
						body.classId
					);

					if (!canMoveToClass) {
						return error(403, {
							success: false,
							message:
								"Access denied. You don't have permission to move this student to the specified class.",
						});
					}

					student.class = newClass;
				}

				await db.em.flush();

				return {
					success: true,
					message: "Student updated successfully",
					data: student,
				};
			} catch (err) {
				console.error("Error updating student:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateStudentDto
	)
	.delete("/:id", async ({ requester, params: { id: studentId } }) => {
		try {
			// Check permissions - Supervisors can delete students from their classes
			const hasAccess = await hasPermission(
				requester,
				Resource.Student,
				Actions.Delete,
				studentId
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message:
						"Access denied. You don't have permission to delete this student.",
				});
			}

			const student = await db.student.findOne({ id: studentId });

			if (!student) {
				return error(404, { success: false, message: "Student not found" });
			}

			await db.em.removeAndFlush(student);

			return {
				success: true,
				message: "Student deleted successfully",
			};
		} catch (err) {
			console.error("Error deleting student:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
