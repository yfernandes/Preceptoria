import Elysia, { status as error, t } from "elysia";
import { HospitalManager } from "./";
import { db } from "@api/db";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import { UserRoles } from "@api/modules/common";
import { FilterQuery } from "@mikro-orm/postgresql";
import { authenticatedUserMiddleware } from "@api/middlewares/authenticatedUser.middleware";

// DTOs for request validation
const createHospitalManagerDto = {
	body: t.Object({
		userId: t.String(),
		hospitalId: t.String(),
	}),
};

const updateHospitalManagerDto = {
	body: t.Object({
		hospitalId: t.Optional(t.String()),
	}),
};

export const hospitalManagerController = new Elysia({
	prefix: "/hospital-managers",
})
	.use(authenticatedUserMiddleware)

	// Create a new hospital manager
	.post(
		"/",
		async ({ body: { userId, hospitalId }, requester }) => {
			try {
				// Check permissions for creating hospital managers
				const hasAccess = await hasPermission(
					requester,
					Resource.HospitalManager,
					Actions.Create,
					""
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to create hospital managers",
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
							"You don't have permission to assign this user as a hospital manager",
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
							"You don't have permission to assign hospital managers to this hospital",
					});
				}

				// Check if user is already a hospital manager
				const existingHospitalManager = await db.hospitalManager.findOne({
					user: { id: userId },
				});
				if (existingHospitalManager) {
					return error(400, {
						success: false,
						message: "User is already a hospital manager",
					});
				}

				// Create new hospital manager
				const newHospitalManager = new HospitalManager(user, hospital);

				await db.em.persistAndFlush(newHospitalManager);

				// Return created hospital manager with populated relationships
				const createdHospitalManager = await db.hospitalManager.findOne(
					{ id: newHospitalManager.id },
					{ populate: ["user", "hospital", "hospital.orgAdmin"] }
				);

				return {
					success: true,
					data: createdHospitalManager,
					message: "Hospital manager created successfully",
				};
			} catch (err) {
				console.error("Error creating hospital manager:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createHospitalManagerDto
	)

	// Get all hospital managers (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const { hospitalId, limit = 10, offset = 0 } = query;

			// Build filter based on user permissions and role
			const filter: FilterQuery<HospitalManager> = {};

			// Apply query filters
			if (hospitalId) {
				filter.hospital = { id: hospitalId };
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see hospital managers of hospitals they have shifts at
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see hospital managers of hospitals where their students have shifts
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see other hospital managers at their hospital
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all hospital managers within their organization
				// This will be handled by the permission system
			}

			// Get hospital managers with pagination
			const hospitalManagers = await db.hospitalManager.find(filter, {
				populate: ["user", "hospital", "hospital.orgAdmin"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: "DESC" },
			});

			// Filter hospital managers based on permissions
			const accessibleHospitalManagers = [];
			for (const hospitalManager of hospitalManagers) {
				const hasAccess = await hasPermission(
					requester,
					Resource.HospitalManager,
					Actions.Read,
					hospitalManager.id
				);

				if (hasAccess) {
					accessibleHospitalManagers.push(hospitalManager);
				}
			}

			return {
				success: true,
				data: accessibleHospitalManagers,
				pagination: {
					total: accessibleHospitalManagers.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore:
						accessibleHospitalManagers.length === parseInt(limit as string),
				},
			};
		} catch (err) {
			console.error("Error fetching hospital managers:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Get a specific hospital manager by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific hospital manager
			const hasAccess = await hasPermission(
				requester,
				Resource.HospitalManager,
				Actions.Read,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to view this hospital manager",
				});
			}

			// Find hospital manager by ID with populated relationships
			const hospitalManager = await db.hospitalManager.findOne(
				{ id },
				{ populate: ["user", "hospital", "hospital.orgAdmin"] }
			);

			if (!hospitalManager) {
				return error(404, {
					success: false,
					message: "Hospital manager not found",
				});
			}

			return {
				success: true,
				data: hospitalManager,
			};
		} catch (err) {
			console.error("Error fetching hospital manager:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Update a hospital manager
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this hospital manager
				const hasAccess = await hasPermission(
					requester,
					Resource.HospitalManager,
					Actions.Update,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"You don't have permission to update this hospital manager",
					});
				}

				// Find hospital manager by ID
				const hospitalManager = await db.hospitalManager.findOne({ id });
				if (!hospitalManager) {
					return error(404, {
						success: false,
						message: "Hospital manager not found",
					});
				}

				// Update hospital if provided
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
								"You don't have permission to assign hospital managers to this hospital",
						});
					}

					hospitalManager.hospital = hospital;
				}

				await db.em.persistAndFlush(hospitalManager);

				// Return updated hospital manager with populated relationships
				const updatedHospitalManager = await db.hospitalManager.findOne(
					{ id },
					{ populate: ["user", "hospital", "hospital.orgAdmin"] }
				);

				return {
					success: true,
					message: "Hospital manager updated successfully",
					data: updatedHospitalManager,
				};
			} catch (err) {
				console.error("Error updating hospital manager:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateHospitalManagerDto
	)

	// Delete a hospital manager
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this hospital manager
			const hasAccess = await hasPermission(
				requester,
				Resource.HospitalManager,
				Actions.Delete,
				id
			);

			if (!hasAccess) {
				return error(403, {
					success: false,
					message: "You don't have permission to delete this hospital manager",
				});
			}

			// Find hospital manager by ID
			const hospitalManager = await db.hospitalManager.findOne({ id });
			if (!hospitalManager) {
				return error(404, {
					success: false,
					message: "Hospital manager not found",
				});
			}

			// Check if hospital manager has associated shifts (prevent deletion if occupied)
			// Note: Hospital managers don't directly have shifts, but we can check if they're managing a hospital with active shifts
			const hospitalWithShifts = await db.hospital.findOne(
				{ id: hospitalManager.hospital.id },
				{ populate: ["shifts"] }
			);

			if (hospitalWithShifts && hospitalWithShifts.shifts.length > 0) {
				return error(400, {
					success: false,
					message:
						"Cannot delete hospital manager while hospital has active shifts. Please reassign or complete shifts first.",
				});
			}

			// Delete hospital manager
			await db.em.removeAndFlush(hospitalManager);

			return {
				success: true,
				message: "Hospital manager deleted successfully",
			};
		} catch (err) {
			console.error("Error deleting hospital manager:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
