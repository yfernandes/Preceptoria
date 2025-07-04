import Elysia, { t } from "elysia";
import { Preceptor } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createPreceptorDto = {
	body: t.Object({
		userId: t.String(),
		specialty: t.String(),
		licenseNumber: t.String(),
	}),
};

const updatePreceptorDto = {
	body: t.Object({
		specialty: t.Optional(t.String()),
		licenseNumber: t.Optional(t.String()),
	}),
};

export const preceptorController = new Elysia({ prefix: "/preceptors" })
	.use(authMiddleware)
	
	// Create a new preceptor
	.post(
		"/",
		async ({ body: { userId, specialty, licenseNumber }, requester, status }) => {
			// TODO: Check permissions for creating preceptors
			// TODO: Validate user exists
			// TODO: Create new preceptor
			// TODO: Return created preceptor
		},
		createPreceptorDto
	)
	
	// Get all preceptors (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading preceptors
		// TODO: Apply role-based filtering
		// TODO: Return filtered preceptors list
	})
	
	// Get a specific preceptor by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific preceptor
		// TODO: Find preceptor by ID
		// TODO: Return preceptor details with populated relationships
	})
	
	// Update a preceptor
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this preceptor
			// TODO: Find and update preceptor
			// TODO: Return updated preceptor
		},
		updatePreceptorDto
	)
	
	// Delete a preceptor
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this preceptor
		// TODO: Check if preceptor has shifts (prevent deletion if occupied)
		// TODO: Delete preceptor
		// TODO: Return success message
	});
