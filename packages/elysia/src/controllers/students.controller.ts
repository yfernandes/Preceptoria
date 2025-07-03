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

export const studentsController = new Elysia({ prefix: "students" })
	.use(authMiddleware)
	.post(
		"/",
		async ({ body: { userId, classId } }) => {
			const user = await db.user.findOne({ id: userId });
			if (!user) return new Error("User Not Found!");

			const classes = await db.classes.findOne({ id: classId });
			if (!classes) return new Error("Class Not Found!");

			const preceptor = new Student(user, classes);
			return preceptor;
		},
		createStudentDto
	)
	.get("/", async ({ requester, status }) => {
		if (requester.sysAdminId) {
			// Full access
			return await db.student.findAll();
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
			});
		}

		if (requester.studentId) {
			// Students can only access themselves
			return await db.student.findOne({ id: requester.studentId });
		}

		status(403);
		return { message: "You do not have permission to access student data." };
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
			return status("Unauthorized");
		}
		return await db.student.findOne({ id: studentId });
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
				return status("Unauthorized");
			}

			const student = await db.student.findOne({ id: studentId });
			if (!student) return status("Not Found");

			// Apply updates (be careful here—validate your input before assigning)
			student.user.name = body.name ?? student.user.name;
			student.user.email = body.email ?? student.user.email;
			student.user.phoneNumber = body.phoneNumber ?? student.user.phoneNumber;
			// ...and so on

			await db.em.flush(); // Persist changes

			return student; // Or sanitized version
		},
		{
			body: t.Object({
				name: t.Optional(t.String()),
				email: t.Optional(t.String()),
				phoneNumber: t.Optional(t.String()),
			}),
		}
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
			return status("Unauthorized");
		}
		return await db.student.findOne({ id: studentId });
	});
