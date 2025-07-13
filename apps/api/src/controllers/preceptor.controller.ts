import Elysia, { status as error, t } from "elysia";
import { Preceptor } from "../entities";
import { db } from "../db";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";
import { UserRoles } from "../modules/common/role.abstract";
import { FilterQuery } from "@mikro-orm/postgresql";
import { authenticatedUserMiddleware } from "@api/middlewares/authenticatedUser.middleware";

// DTOs for request validation
const createPreceptorDto = {
	body: t.Object({
		userId: t.String(),
		hospitalId: t.String(),
		specialty: t.String(),
		licenseNumber: t.String(),
	}),
};

const updatePreceptorDto = {
	body: t.Object({
		hospitalId: t.Optional(t.String()),
		specialty: t.Optional(t.String()),
		licenseNumber: t.Optional(t.String()),
	}),
};

export const preceptorController = new Elysia({ prefix: "/preceptors" })
	.use(authenticatedUserMiddleware)

	// Create a new preceptor
	.post(
		"/",
		async ({
			body: { userId, hospitalId, specialty, licenseNumber },
			requester,
		}) => {
			try {
				// Check permissions for creating preceptors
				const hasAccess = await hasPermission(
					requester,
					Resource.Preceptor,
					Actions.Create,
					""
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to create preceptors",
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
					Resource.User,
					Actions.Read,
					userId
				);

				if (!hasUserAccess) {
					return error(403, {
						success: false,
						message:
							"You don't have permission to assign this user as a preceptor",
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
							"You don't have permission to assign preceptors to this hospital",
					});
				}

				// Check if user is already a preceptor
				const existingPreceptor = await db.preceptor.findOne({
					user: { id: userId },
				});
				if (existingPreceptor) {
					return error(400, {
						success: false,
						message: "User is already a preceptor",
					});
				}

				// Create new preceptor
				const newPreceptor = new Preceptor(user, hospital);
				newPreceptor.specialty = specialty;
				newPreceptor.licenseNumber = licenseNumber;

				await db.em.persistAndFlush(newPreceptor);

				// Return created preceptor with populated relationships
				const createdPreceptor = await db.preceptor.findOne(
					{ id: newPreceptor.id },
					{ populate: ["user", "hospital", "hospital.orgAdmin"] }
				);

				return {
					success: true,
					data: createdPreceptor,
					message: "Preceptor created successfully",
				};
			} catch (err) {
				console.error("Error creating preceptor:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createPreceptorDto
	)

	// Get all preceptors (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const { hospitalId, specialty, limit = 10, offset = 0 } = query;

			// Build filter based on user permissions and role
			const filter: FilterQuery<Preceptor> = {};

			// Apply query filters
			if (hospitalId) {
				filter.hospital = { id: hospitalId };
			}

			if (specialty) {
				filter.specialty = { $ilike: `%${specialty}%` };
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see preceptors of hospitals they have shifts at
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see preceptors of hospitals where their students have shifts
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see preceptors at their hospital
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Preceptor)) {
				// Preceptors can see other preceptors at their hospital
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all preceptors within their organization
				// This will be handled by the permission system
			}

			// Get preceptors with pagination
			const preceptors = await db.preceptor.find(filter, {
				populate: ["user", "hospital", "hospital.orgAdmin", "shifts"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: "DESC" },
			});

			// Filter preceptors based on permissions
			const accessiblePreceptors = [];
			for (const preceptor of preceptors) {
				const hasAccess = await hasPermission(
					requester,
					Resource.Preceptor,
					Actions.Read,
					preceptor.id
				);

				if (hasAccess) {
					accessiblePreceptors.push(preceptor);
				}
			}

			return {
				success: true,
				data: accessiblePreceptors,
				pagination: {
					total: accessiblePreceptors.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessiblePreceptors.length === parseInt(limit as string),
				},
			};
		} catch (err) {
			console.error("Error fetching preceptors:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Get a specific preceptor by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific preceptor
			const hasAccess = await hasPermission(
				requester,
				Resource.Preceptor,
				Actions.Read,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to view this preceptor",
				});
			}

			// Find preceptor by ID with populated relationships
			const preceptor = await db.preceptor.findOne(
				{ id },
				{ populate: ["user", "hospital", "hospital.orgAdmin", "shifts"] }
			);

			if (!preceptor) {
				return error(404, { success: false, message: "Preceptor not found" });
			}

			return {
				success: true,
				data: preceptor,
			};
		} catch (err) {
			console.error("Error fetching preceptor:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Update a preceptor
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this preceptor
				const hasAccess = await hasPermission(
					requester,
					Resource.Preceptor,
					Actions.Update,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to update this preceptor",
					});
				}

				// Find preceptor by ID
				const preceptor = await db.preceptor.findOne({ id });
				if (!preceptor) {
					return error(404, { success: false, message: "Preceptor not found" });
				}

				// Update fields if provided
				if (body.hospitalId) {
					// Validate hospital exists and user has access to it
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
								"You don't have permission to assign preceptors to this hospital",
						});
					}

					preceptor.hospital = hospital;
				}

				if (body.specialty) {
					preceptor.specialty = body.specialty;
				}

				if (body.licenseNumber) {
					preceptor.licenseNumber = body.licenseNumber;
				}

				await db.em.persistAndFlush(preceptor);

				// Return updated preceptor with populated relationships
				const updatedPreceptor = await db.preceptor.findOne(
					{ id },
					{ populate: ["user", "hospital", "hospital.orgAdmin", "shifts"] }
				);

				return {
					success: true,
					message: "Preceptor updated successfully",
					data: updatedPreceptor,
				};
			} catch (err) {
				console.error("Error updating preceptor:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updatePreceptorDto
	)

	// Delete a preceptor
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this preceptor
			const hasAccess = await hasPermission(
				requester,
				Resource.Preceptor,
				Actions.Delete,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to delete this preceptor",
				});
			}

			// Find preceptor by ID with shifts
			const preceptor = await db.preceptor.findOne(
				{ id },
				{ populate: ["shifts"] }
			);

			if (!preceptor) {
				return error(404, { success: false, message: "Preceptor not found" });
			}

			// Check if preceptor has associated shifts (prevent deletion if occupied)
			if (preceptor.shifts.length > 0) {
				return error(400, {
					success: false,
					message:
						"Cannot delete preceptor while they have active shifts. Please reassign or complete shifts first.",
				});
			}

			// Delete preceptor
			await db.em.removeAndFlush(preceptor);

			return {
				success: true,
				message: "Preceptor deleted successfully",
			};
		} catch (err) {
			console.error("Error deleting preceptor:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
