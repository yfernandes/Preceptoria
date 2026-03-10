import Elysia, { status as error, t } from "elysia";
import { Supervisor } from "@api/modules/supervisors/supervisor.entity";
import { db } from "@api/db";
import { authenticatedUserMiddleware } from "@api/middleware/authenticatedUser.middleware";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import { UserRoles } from "@api/modules/common/";
import { FilterQuery } from "@mikro-orm/postgresql";

// DTOs for request validation
const createSupervisorDto = {
	body: t.Object({
		userId: t.String(),
		schoolId: t.String(),
		department: t.String(),
		academicTitle: t.String(),
	}),
};

const updateSupervisorDto = {
	body: t.Object({
		department: t.Optional(t.String()),
		academicTitle: t.Optional(t.String()),
	}),
};

export const supervisorController = new Elysia({ prefix: "/supervisors" })
	.use(authenticatedUserMiddleware)

	// Create a new supervisor
	.post(
		"/",
		async ({ body: { userId, schoolId }, requester }) => {
			try {
				// Check permissions for creating supervisors
				const hasAccess = await hasPermission(
					requester,
					Resource.Supervisor,
					Actions.Create,
					""
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to create supervisors",
					});
				}

				// Validate user exists and user has access to them
				const user = await db.user.findOne({ id: userId });
				if (!user) {
					return error(404, {
						success: false,
						message: "User not found",
					});
				}

				// Check if user has access to this user
				const hasUserAccess = await hasPermission(
					requester,
					Resource.Student, // Using Student as proxy for User access
					Actions.Read,
					userId
				);

				if (!hasUserAccess) {
					return error(403, {
						success: false,
						message:
							"You don't have permission to assign this user as a supervisor",
					});
				}

				// Validate school exists and user has access to it
				const school = await db.school.findOne({ id: schoolId });
				if (!school) {
					return error(404, {
						success: false,
						message: "School not found",
					});
				}

				// Check if user has access to this school
				const hasSchoolAccess = await hasPermission(
					requester,
					Resource.School,
					Actions.Read,
					schoolId
				);

				if (!hasSchoolAccess) {
					return error(403, {
						success: false,
						message:
							"You don't have permission to assign supervisors to this school",
					});
				}

				// Check if user is already a supervisor
				const existingSupervisor = await db.supervisor.findOne({
					user: { id: userId },
				});
				if (existingSupervisor) {
					return error(400, {
						success: false,
						message: "User is already a supervisor",
					});
				}

				// Create new supervisor
				const newSupervisor = new Supervisor(user, school);

				await db.em.persistAndFlush(newSupervisor);

				// Return created supervisor with populated relationships
				const createdSupervisor = await db.supervisor.findOne(
					{ id: newSupervisor.id },
					{ populate: ["user", "school", "school.orgAdmin"] }
				);

				return {
					success: true,
					data: createdSupervisor,
					message: "Supervisor created successfully",
				};
			} catch (err) {
				console.error("Error creating supervisor:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createSupervisorDto
	)

	// Get all supervisors (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const { schoolId, limit = 10, offset = 0 } = query;

			// Build filter based on user permissions and role
			const filter: FilterQuery<Supervisor> = {};

			// Apply query filters
			if (schoolId) {
				filter.school = { id: schoolId };
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see supervisors of their courses
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see other supervisors at their school
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see supervisors of students at their hospital
				// This requires complex filtering based on shift assignments
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all supervisors within their organization
				// This requires filtering by organization
			}

			// Get supervisors with pagination
			const supervisors = await db.supervisor.find(filter, {
				populate: ["user", "school", "courses"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: "DESC" },
			});

			// Filter supervisors based on permissions
			const accessibleSupervisors = [];
			for (const supervisor of supervisors) {
				const hasAccess = await hasPermission(
					requester,
					Resource.Supervisor,
					Actions.Read,
					supervisor.id
				);

				if (hasAccess) {
					accessibleSupervisors.push(supervisor);
				}
			}

			return {
				success: true,
				data: accessibleSupervisors,
				pagination: {
					total: accessibleSupervisors.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleSupervisors.length === parseInt(limit as string),
				},
			};
		} catch (err) {
			console.error("Error fetching supervisors:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Get a specific supervisor by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific supervisor
			const hasAccess = await hasPermission(
				requester,
				Resource.Supervisor,
				Actions.Read,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to view this supervisor",
				});
			}

			// Find supervisor by ID with populated relationships
			const supervisor = await db.supervisor.findOne(
				{ id },
				{
					populate: [
						"user",
						"school",
						"courses",
						"courses.classes",
						"courses.classes.students",
						"school.orgAdmin",
					],
				}
			);

			if (!supervisor) {
				return error(404, {
					success: false,
					message: "Supervisor not found",
				});
			}

			return {
				success: true,
				data: supervisor,
			};
		} catch (err) {
			console.error("Error fetching supervisor:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Update a supervisor
	.patch(
		"/:id",
		async ({ params: { id }, requester }) => {
			try {
				// Check permissions for updating this supervisor
				const hasAccess = await hasPermission(
					requester,
					Resource.Supervisor,
					Actions.Update,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to update this supervisor",
					});
				}

				// Find supervisor by ID
				const supervisor = await db.supervisor.findOne({ id });
				if (!supervisor) {
					return error(404, {
						success: false,
						message: "Supervisor not found",
					});
				}

				// Update supervisor properties (if they exist in the entity)
				// Note: department and academicTitle are not currently part of the entity
				// They would need to be added to the Supervisor entity if required

				await db.em.persistAndFlush(supervisor);

				// Return updated supervisor with populated relationships
				const updatedSupervisor = await db.supervisor.findOne(
					{ id },
					{ populate: ["user", "school", "courses", "school.orgAdmin"] }
				);

				return {
					success: true,
					data: updatedSupervisor,
					message: "Supervisor updated successfully",
				};
			} catch (err) {
				console.error("Error updating supervisor:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateSupervisorDto
	)

	// Delete a supervisor
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this supervisor
			const hasAccess = await hasPermission(
				requester,
				Resource.Supervisor,
				Actions.Delete,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to delete this supervisor",
				});
			}

			// Find supervisor by ID with courses
			const supervisor = await db.supervisor.findOne(
				{ id },
				{ populate: ["courses"] }
			);

			if (!supervisor) {
				return error(404, {
					success: false,
					message: "Supervisor not found",
				});
			}

			// Check if supervisor has courses (prevent deletion if occupied)
			if (supervisor.courses.length > 0) {
				return error(400, {
					success: false,
					message:
						"Cannot delete supervisor that has courses. Please reassign or remove courses first.",
				});
			}

			// Delete supervisor
			await db.em.removeAndFlush(supervisor);

			return {
				success: true,
				message: "Supervisor deleted successfully",
			};
		} catch (err) {
			console.error("Error deleting supervisor:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
