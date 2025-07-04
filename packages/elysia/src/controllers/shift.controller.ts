import Elysia, { error, t } from "elysia";
import { Shift } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";
import { UserRoles } from "../entities/role.abstract";

// DTOs for request validation
const createShiftDto = {
	body: t.Object({
		date: t.String(), // ISO date string
		startTime: t.String(), // ISO date string
		endTime: t.String(), // ISO date string
		location: t.String(),
		hospitalId: t.String(),
		preceptorId: t.String(),
		studentIds: t.Array(t.String()), // Array of student IDs
	}),
};

const updateShiftDto = {
	body: t.Object({
		date: t.Optional(t.String()),
		startTime: t.Optional(t.String()),
		endTime: t.Optional(t.String()),
		location: t.Optional(t.String()),
		hospitalId: t.Optional(t.String()),
		preceptorId: t.Optional(t.String()),
		studentIds: t.Optional(t.Array(t.String())),
	}),
};

export const shiftController = new Elysia({ prefix: "/shifts" })
	.use(authMiddleware)

	// Create a new shift
	.post(
		"/",
		async ({
			body: {
				date,
				startTime,
				endTime,
				location,
				hospitalId,
				preceptorId,
				studentIds,
			},
			requester,
		}) => {
			try {
				// Check permissions for creating shifts
				const hasAccess = await hasPermission(
					requester,
					Resource.Shift,
					Actions.Create,
					""
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to create shifts",
					});
				}

				// Validate hospital exists and user has access to it
				const hospital = await db.hospital.findOne({ id: hospitalId });
				if (!hospital) {
					return error(404, {
						success: false,
						message: "Hospital not found",
					});
				}

				// Check if user has access to this hospital
				const hasHospitalAccess = await hasPermission(
					requester,
					Resource.Hospital,
					Actions.Read,
					hospitalId
				);

				if (!hasHospitalAccess) {
					return error(403, {
						success: false,
						message:
							"You don't have permission to create shifts at this hospital",
					});
				}

				// Validate preceptor exists and user has access to them
				const preceptor = await db.preceptor.findOne({ id: preceptorId });
				if (!preceptor) {
					return error(404, {
						success: false,
						message: "Preceptor not found",
					});
				}

				// Check if user has access to this preceptor
				const hasPreceptorAccess = await hasPermission(
					requester,
					Resource.Preceptor,
					Actions.Read,
					preceptorId
				);

				if (!hasPreceptorAccess) {
					return error(403, {
						success: false,
						message:
							"You don't have permission to assign this preceptor to the shift",
					});
				}

				// Validate students exist and user has access to them
				const students = [];
				for (const studentId of studentIds) {
					const student = await db.student.findOne({ id: studentId });
					if (!student) {
						return error(404, {
							success: false,
							message: `Student with ID ${studentId} not found`,
						});
					}

					// Check if user has access to this student
					const hasStudentAccess = await hasPermission(
						requester,
						Resource.Student,
						Actions.Read,
						studentId
					);

					if (!hasStudentAccess) {
						return error(403, {
							success: false,
							message: `You don't have permission to assign student ${studentId} to the shift`,
						});
					}

					students.push(student);
				}

				// Check for time conflicts
				const shiftDate = new Date(date);
				const shiftStartTime = new Date(startTime);
				const shiftEndTime = new Date(endTime);

				// Check if preceptor has conflicting shifts
				const preceptorConflicts = await db.shift.find({
					preceptor: { id: preceptorId },
					date: shiftDate,
					$or: [
						{
							startTime: { $lt: shiftEndTime },
							endTime: { $gt: shiftStartTime },
						},
					],
				});

				if (preceptorConflicts.length > 0) {
					return error(400, {
						success: false,
						message: "Preceptor has conflicting shifts at this time",
					});
				}

				// Check if students have conflicting shifts
				for (const student of students) {
					const studentConflicts = await db.shift.find({
						students: { id: student.id },
						date: shiftDate,
						$or: [
							{
								startTime: { $lt: shiftEndTime },
								endTime: { $gt: shiftStartTime },
							},
						],
					});

					if (studentConflicts.length > 0) {
						return error(400, {
							success: false,
							message: `Student ${student.id} has conflicting shifts at this time`,
						});
					}
				}

				// Create new shift
				const newShift = new Shift(
					shiftDate,
					shiftStartTime,
					shiftEndTime,
					location,
					hospital,
					preceptor
				);

				// Add students to the shift
				for (const student of students) {
					newShift.students.add(student);
				}

				await db.em.persistAndFlush(newShift);

				// Return created shift with populated relationships
				const createdShift = await db.shift.findOne(
					{ id: newShift.id },
					{ populate: ["hospital", "preceptor", "students"] }
				);

				return {
					success: true,
					data: createdShift,
					message: "Shift created successfully",
				};
			} catch (err) {
				console.error("Error creating shift:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createShiftDto
	)

	// Get all shifts (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const {
				hospitalId,
				preceptorId,
				studentId,
				date,
				limit = 10,
				offset = 0,
			} = query;

			// Build filter based on user permissions and role
			const filter: any = {};

			// Apply query filters
			if (hospitalId) {
				filter.hospital = { id: hospitalId };
			}

			if (preceptorId) {
				filter.preceptor = { id: preceptorId };
			}

			if (studentId) {
				filter.students = { id: studentId };
			}

			if (date) {
				filter.date = new Date(date);
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see their own shifts
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Preceptor)) {
				// Preceptors can see shifts they're assigned to
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see shifts for their students
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see shifts at their hospital
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all shifts within their organization
				// This requires filtering by organization
			}

			// Get shifts with pagination
			const shifts = await db.shift.find(filter, {
				populate: ["hospital", "preceptor", "students"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { date: "DESC", startTime: "ASC" },
			});

			// Filter shifts based on permissions
			const accessibleShifts = [];
			for (const shift of shifts) {
				const hasAccess = await hasPermission(
					requester,
					Resource.Shift,
					Actions.Read,
					shift.id
				);

				if (hasAccess) {
					accessibleShifts.push(shift);
				}
			}

			return {
				success: true,
				data: accessibleShifts,
				pagination: {
					total: accessibleShifts.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleShifts.length === parseInt(limit as string),
				},
			};
		} catch (err) {
			console.error("Error fetching shifts:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Get a specific shift by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific shift
			const hasAccess = await hasPermission(
				requester,
				Resource.Shift,
				Actions.Read,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to view this shift",
				});
			}

			// Find shift by ID with populated relationships
			const shift = await db.shift.findOne(
				{ id },
				{
					populate: [
						"hospital",
						"preceptor",
						"students",
						"students.class",
						"students.class.course",
					],
				}
			);

			if (!shift) {
				return error(404, {
					success: false,
					message: "Shift not found",
				});
			}

			return {
				success: true,
				data: shift,
			};
		} catch (err) {
			console.error("Error fetching shift:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Update a shift
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this shift
				const hasAccess = await hasPermission(
					requester,
					Resource.Shift,
					Actions.Update,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to update this shift",
					});
				}

				// Find shift by ID
				const shift = await db.shift.findOne({ id });
				if (!shift) {
					return error(404, {
						success: false,
						message: "Shift not found",
					});
				}

				// Validate hospital exists if hospitalId is being updated
				if (body.hospitalId) {
					const hospital = await db.hospital.findOne({ id: body.hospitalId });
					if (!hospital) {
						return error(404, {
							success: false,
							message: "Hospital not found",
						});
					}

					// Check if user has access to this hospital
					const hasHospitalAccess = await hasPermission(
						requester,
						Resource.Hospital,
						Actions.Read,
						body.hospitalId
					);

					if (!hasHospitalAccess) {
						return error(403, {
							success: false,
							message:
								"You don't have permission to assign this shift to the specified hospital",
						});
					}

					shift.hospital = hospital;
				}

				// Validate preceptor exists if preceptorId is being updated
				if (body.preceptorId) {
					const preceptor = await db.preceptor.findOne({
						id: body.preceptorId,
					});
					if (!preceptor) {
						return error(404, {
							success: false,
							message: "Preceptor not found",
						});
					}

					// Check if user has access to this preceptor
					const hasPreceptorAccess = await hasPermission(
						requester,
						Resource.Preceptor,
						Actions.Read,
						body.preceptorId
					);

					if (!hasPreceptorAccess) {
						return error(403, {
							success: false,
							message:
								"You don't have permission to assign this preceptor to the shift",
						});
					}

					shift.preceptor = preceptor;
				}

				// Update students if studentIds is being updated
				if (body.studentIds) {
					// Clear existing students
					shift.students.removeAll();

					// Add new students
					for (const studentId of body.studentIds) {
						const student = await db.student.findOne({ id: studentId });
						if (!student) {
							return error(404, {
								success: false,
								message: `Student with ID ${studentId} not found`,
							});
						}

						// Check if user has access to this student
						const hasStudentAccess = await hasPermission(
							requester,
							Resource.Student,
							Actions.Read,
							studentId
						);

						if (!hasStudentAccess) {
							return error(403, {
								success: false,
								message: `You don't have permission to assign student ${studentId} to the shift`,
							});
						}

						shift.students.add(student);
					}
				}

				// Update shift properties
				if (body.date) {
					shift.date = new Date(body.date);
				}

				if (body.startTime) {
					shift.startTime = new Date(body.startTime);
				}

				if (body.endTime) {
					shift.endTime = new Date(body.endTime);
				}

				if (body.location) {
					shift.location = body.location;
				}

				await db.em.persistAndFlush(shift);

				// Return updated shift with populated relationships
				const updatedShift = await db.shift.findOne(
					{ id },
					{ populate: ["hospital", "preceptor", "students"] }
				);

				return {
					success: true,
					data: updatedShift,
					message: "Shift updated successfully",
				};
			} catch (err) {
				console.error("Error updating shift:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateShiftDto
	)

	// Delete a shift
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this shift
			const hasAccess = await hasPermission(
				requester,
				Resource.Shift,
				Actions.Delete,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to delete this shift",
				});
			}

			// Find shift by ID
			const shift = await db.shift.findOne({ id });
			if (!shift) {
				return error(404, {
					success: false,
					message: "Shift not found",
				});
			}

			// Delete shift
			await db.em.removeAndFlush(shift);

			return {
				success: true,
				message: "Shift deleted successfully",
			};
		} catch (err) {
			console.error("Error deleting shift:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
