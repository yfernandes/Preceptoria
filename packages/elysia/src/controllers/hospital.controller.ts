import Elysia, { t } from "elysia";
import { Hospital } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createHospitalDto = {
	body: t.Object({
		name: t.String(),
		address: t.String(),
		managerId: t.String(),
	}),
};

const updateHospitalDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		address: t.Optional(t.String()),
		managerId: t.Optional(t.String()),
	}),
};

export const hospitalController = new Elysia({ prefix: "/hospitals" })
	.use(authMiddleware)
	
	// Create a new hospital
	.post(
		"/",
		async ({ body: { name, address, managerId }, requester, status }) => {
			// TODO: Check permissions for creating hospitals
			// TODO: Validate manager exists
			// TODO: Create new hospital
			// TODO: Return created hospital
		},
		createHospitalDto
	)
	
	// Get all hospitals (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading hospitals
		// TODO: Apply role-based filtering (hospital managers see their hospitals, etc.)
		// TODO: Return filtered hospitals list
	})
	
	// Get a specific hospital by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific hospital
		// TODO: Find hospital by ID
		// TODO: Return hospital details with populated relationships
	})
	
	// Update a hospital
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this hospital
			// TODO: Find and update hospital
			// TODO: Return updated hospital
		},
		updateHospitalDto
	)
	
	// Delete a hospital
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this hospital
		// TODO: Check if hospital has shifts (prevent deletion if occupied)
		// TODO: Delete hospital
		// TODO: Return success message
	});
