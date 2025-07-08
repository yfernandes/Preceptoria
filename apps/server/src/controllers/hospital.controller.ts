import Elysia, { t } from "elysia";
import { Hospital } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createHospitalDto = {
	body: t.Object({
		name: t.String({ minLength: 1 }),
		address: t.String({ minLength: 1 }),
		managerId: t.String(),
		phone: t.Optional(t.String()),
		email: t.Optional(t.String({ format: "email" })),
	}),
};

const updateHospitalDto = {
	body: t.Object({
		name: t.Optional(t.String({ minLength: 1 })),
		address: t.Optional(t.String({ minLength: 1 })),
		managerId: t.Optional(t.String()),
		phone: t.Optional(t.String()),
		email: t.Optional(t.String({ format: "email" })),
	}),
};

export const hospitalController = new Elysia({ prefix: "/hospitals" })
	.use(authMiddleware)

	// Create a new hospital
	.post(
		"/",
		async ({
			body: { name, address, managerId, phone, email },
			requester,
			status,
		}) => {
			try {
				// Check permissions
				if (
					!(await hasPermission(
						requester,
						Resource.Hospital,
						Actions.Create,
						""
					))
				) {
					return status(403, {
						error: "Insufficient permissions to create hospitals",
					});
				}

				// Validate manager exists and belongs to the same organization
				const manager = await db.hospitalManager.findOne(
					{ id: managerId },
					{ populate: ["user", "hospital"] }
				);
				if (!manager) {
					return status(400, { error: "Hospital manager not found" });
				}

				// Check if manager is already assigned to another hospital
				if (manager.hospital && manager.hospital.id) {
					return status(400, {
						error: "Hospital manager is already assigned to another hospital",
					});
				}

				// Check for duplicate hospital name within the organization
				const existingHospital = await db.hospital.findOne({ name });
				if (existingHospital) {
					return status(400, {
						error: "Hospital with this name already exists",
					});
				}

				// Create new hospital
				const hospital = new Hospital(name, address, email || "", phone || "");

				await db.em.persistAndFlush(hospital);

				// Return created hospital with populated relationships
				const createdHospital = await db.hospital.findOne(
					{ id: hospital.id },
					{ populate: ["manager.user", "shifts"] }
				);

				return status(201, createdHospital);
			} catch (error) {
				console.error("Error creating hospital:", error);
				return status(500, { error: "Internal server error" });
			}
		},
		createHospitalDto
	)

	// Get all hospitals (with optional filtering)
	.get("/", async ({ requester, status }) => {
		try {
			// Check permissions
			if (
				!(await hasPermission(requester, Resource.Hospital, Actions.Read, ""))
			) {
				return status(403, {
					error: "Insufficient permissions to read hospitals",
				});
			}

			let hospitals;

			// Apply role-based filtering
			if (requester.orgAdminId) {
				// OrgAdmin sees hospitals in their organization
				hospitals = await db.hospital.find(
					{},
					{ populate: ["manager.user", "shifts"] }
				);
			} else if (requester.hospitalManagerId) {
				// HospitalManager sees only their own hospital
				hospitals = await db.hospital.find(
					{ manager: requester.hospitalManagerId },
					{ populate: ["manager.user", "shifts"] }
				);
			} else if (
				requester.supervisorId ||
				requester.preceptorId ||
				requester.studentId
			) {
				// Other roles see basic hospital info (for shift creation/navigation)
				hospitals = await db.hospital.find({}, { populate: ["manager.user"] });
			} else {
				return status(403, { error: "Invalid user role" });
			}

			return hospitals;
		} catch (error) {
			console.error("Error fetching hospitals:", error);
			return status(500, { error: "Internal server error" });
		}
	})

	// Get a specific hospital by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		try {
			// Check permissions
			if (
				!(await hasPermission(requester, Resource.Hospital, Actions.Read, id))
			) {
				return status(403, {
					error: "Insufficient permissions to read this hospital",
				});
			}

			// Find hospital by ID
			const hospital = await db.hospital.findOne(
				{ id },
				{ populate: ["manager.user", "shifts.preceptor", "shifts.students"] }
			);

			if (!hospital) {
				return status(404, { error: "Hospital not found" });
			}

			return hospital;
		} catch (error) {
			console.error("Error fetching hospital:", error);
			return status(500, { error: "Internal server error" });
		}
	})

	// Update a hospital
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			try {
				// Check permissions
				if (
					!(await hasPermission(
						requester,
						Resource.Hospital,
						Actions.Update,
						id
					))
				) {
					return status(403, {
						error: "Insufficient permissions to update this hospital",
					});
				}

				// Find hospital
				const hospital = await db.hospital.findOne(
					{ id },
					{ populate: ["manager.user"] }
				);

				if (!hospital) {
					return status(404, { error: "Hospital not found" });
				}

				// Validate manager if being updated
				if (body.managerId) {
					const currentManager = await db.hospitalManager.findOne({
						hospital: id,
					});
					if (body.managerId !== currentManager?.id) {
						const newManager = await db.hospitalManager.findOne(
							{ id: body.managerId },
							{ populate: ["user", "hospital"] }
						);
						if (!newManager) {
							return status(400, { error: "Hospital manager not found" });
						}
						if (newManager.hospital && newManager.hospital.id !== id) {
							return status(400, {
								error:
									"Hospital manager is already assigned to another hospital",
							});
						}
					}
				}

				// Check for duplicate name if being updated
				if (body.name && body.name !== hospital.name) {
					const existingHospital = await db.hospital.findOne({
						name: body.name,
					});
					if (existingHospital) {
						return status(400, {
							error: "Hospital with this name already exists",
						});
					}
				}

				// Update hospital
				Object.assign(hospital, body);
				await db.em.persistAndFlush(hospital);

				// Return updated hospital with populated relationships
				const updatedHospital = await db.hospital.findOne(
					{ id },
					{ populate: ["manager.user", "shifts"] }
				);

				return updatedHospital;
			} catch (error) {
				console.error("Error updating hospital:", error);
				return status(500, { error: "Internal server error" });
			}
		},
		updateHospitalDto
	)

	// Delete a hospital
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		try {
			// Check permissions
			if (
				!(await hasPermission(requester, Resource.Hospital, Actions.Delete, id))
			) {
				return status(403, {
					error: "Insufficient permissions to delete this hospital",
				});
			}

			// Find hospital
			const hospital = await db.hospital.findOne(
				{ id },
				{ populate: ["manager.user", "shifts"] }
			);

			if (!hospital) {
				return status(404, { error: "Hospital not found" });
			}

			// Check if hospital has active shifts
			if (hospital.shifts && hospital.shifts.length > 0) {
				return status(400, {
					error:
						"Cannot delete hospital with active shifts. Please reassign or cancel all shifts first.",
				});
			}

			// Delete hospital
			await db.em.removeAndFlush(hospital);

			return { success: true, message: "Hospital deleted successfully" };
		} catch (error) {
			console.error("Error deleting hospital:", error);
			return status(500, { error: "Internal server error" });
		}
	});
