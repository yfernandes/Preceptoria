import Elysia, { error, t } from "elysia";
import { School } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";
import { UserRoles } from "../entities/role.abstract";

// DTOs for request validation
const createSchoolDto = {
	body: t.Object({
		name: t.String(),
		address: t.String(),
		email: t.String(),
		phone: t.String(),
	}),
};

const updateSchoolDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		address: t.Optional(t.String()),
		email: t.Optional(t.String()),
		phone: t.Optional(t.String()),
	}),
};

export const schoolController = new Elysia({ prefix: "/schools" })
	.use(authMiddleware)

	// Create a new school
	.post(
		"/",
		async ({ body: { name, address, email, phone }, requester }) => {
			try {
				// Check permissions for creating schools
				const hasAccess = await hasPermission(
					requester,
					Resource.School,
					Actions.Create,
					""
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to create schools",
					});
				}

				// Validate email format
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(email)) {
					return error(400, {
						success: false,
						message: "Invalid email format",
					});
				}

				// Validate phone format (Brazilian format)
				const phoneRegex = /^\+55\s?\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
				if (!phoneRegex.test(phone)) {
					return error(400, {
						success: false,
						message: "Invalid phone format. Expected: +55 (XX) XXXXX-XXXX",
					});
				}

				// Check if school with same name already exists
				const existingSchool = await db.school.findOne({ name });
				if (existingSchool) {
					return error(400, {
						success: false,
						message: "A school with this name already exists",
					});
				}

				// Create new school
				const newSchool = new School(name, address, email, phone);

				await db.em.persistAndFlush(newSchool);

				// Return created school with populated relationships
				const createdSchool = await db.school.findOne(
					{ id: newSchool.id },
					{ populate: ["orgAdmin", "courses", "supervisors"] }
				);

				return {
					success: true,
					data: createdSchool,
					message: "School created successfully",
				};
			} catch (err) {
				console.error("Error creating school:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createSchoolDto
	)

	// Get all schools (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const { name, limit = 10, offset = 0 } = query;

			// Build filter based on user permissions and role
			const filter: any = {};

			// Apply query filters
			if (name) {
				filter.name = { $ilike: `%${name}%` };
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can see schools they're enrolled in
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see their school
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see schools with students at their hospital
				// This requires complex filtering based on shift assignments
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see schools within their organization
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.SysAdmin)) {
				// SysAdmins can see all schools
				// This will be handled by the permission system
			}

			// Get schools with pagination
			const schools = await db.school.find(filter, {
				populate: ["orgAdmin", "courses", "supervisors"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: "DESC" },
			});

			// Filter schools based on permissions
			const accessibleSchools = [];
			for (const school of schools) {
				const hasAccess = await hasPermission(
					requester,
					Resource.School,
					Actions.Read,
					school.id
				);

				if (hasAccess) {
					accessibleSchools.push(school);
				}
			}

			return {
				success: true,
				data: accessibleSchools,
				pagination: {
					total: accessibleSchools.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleSchools.length === parseInt(limit as string),
				},
			};
		} catch (err) {
			console.error("Error fetching schools:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Get a specific school by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific school
			const hasAccess = await hasPermission(
				requester,
				Resource.School,
				Actions.Read,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to view this school",
				});
			}

			// Find school by ID with populated relationships
			const school = await db.school.findOne(
				{ id },
				{
					populate: [
						"orgAdmin",
						"courses",
						"courses.classes",
						"courses.classes.students",
						"supervisors",
						"supervisors.user",
					],
				}
			);

			if (!school) {
				return error(404, {
					success: false,
					message: "School not found",
				});
			}

			return {
				success: true,
				data: school,
			};
		} catch (err) {
			console.error("Error fetching school:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Update a school
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this school
				const hasAccess = await hasPermission(
					requester,
					Resource.School,
					Actions.Update,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to update this school",
					});
				}

				// Find school by ID
				const school = await db.school.findOne({ id });
				if (!school) {
					return error(404, {
						success: false,
						message: "School not found",
					});
				}

				// Validate email format if being updated
				if (body.email) {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(body.email)) {
						return error(400, {
							success: false,
							message: "Invalid email format",
						});
					}
				}

				// Validate phone format if being updated
				if (body.phone) {
					const phoneRegex = /^\+55\s?\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
					if (!phoneRegex.test(body.phone)) {
						return error(400, {
							success: false,
							message: "Invalid phone format. Expected: +55 (XX) XXXXX-XXXX",
						});
					}
				}

				// Check if school name is being changed and if it conflicts with existing school
				if (body.name && body.name !== school.name) {
					const existingSchool = await db.school.findOne({ name: body.name });
					if (existingSchool) {
						return error(400, {
							success: false,
							message: "A school with this name already exists",
						});
					}
				}

				// Update school properties
				if (body.name) {
					school.name = body.name;
				}

				if (body.address) {
					school.address = body.address;
				}

				if (body.email) {
					school.email = body.email;
				}

				if (body.phone) {
					school.phone = body.phone;
				}

				await db.em.persistAndFlush(school);

				// Return updated school with populated relationships
				const updatedSchool = await db.school.findOne(
					{ id },
					{ populate: ["orgAdmin", "courses", "supervisors"] }
				);

				return {
					success: true,
					data: updatedSchool,
					message: "School updated successfully",
				};
			} catch (err) {
				console.error("Error updating school:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateSchoolDto
	)

	// Delete a school
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this school
			const hasAccess = await hasPermission(
				requester,
				Resource.School,
				Actions.Delete,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to delete this school",
				});
			}

			// Find school by ID with courses and supervisors
			const school = await db.school.findOne(
				{ id },
				{ populate: ["courses", "supervisors", "orgAdmin"] }
			);

			if (!school) {
				return error(404, {
					success: false,
					message: "School not found",
				});
			}

			// Check if school has courses (prevent deletion if occupied)
			if (school.courses.length > 0) {
				return error(400, {
					success: false,
					message:
						"Cannot delete school that has courses. Please remove or reassign courses first.",
				});
			}

			// Check if school has supervisors (prevent deletion if occupied)
			if (school.supervisors.length > 0) {
				return error(400, {
					success: false,
					message:
						"Cannot delete school that has supervisors. Please remove or reassign supervisors first.",
				});
			}

			// Check if school has org admins (prevent deletion if occupied)
			if (school.orgAdmin.length > 0) {
				return error(400, {
					success: false,
					message:
						"Cannot delete school that has org admins. Please remove or reassign org admins first.",
				});
			}

			// Delete school
			await db.em.removeAndFlush(school);

			return {
				success: true,
				message: "School deleted successfully",
			};
		} catch (err) {
			console.error("Error deleting school:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
