import Elysia, { t } from "elysia";
import { Supervisor } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createSupervisorDto = {
	body: t.Object({
		userId: t.String(),
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
	.use(authMiddleware)
	
	// Create a new supervisor
	.post(
		"/",
		async ({ body: { userId, department, academicTitle }, requester, status }) => {
			// TODO: Check permissions for creating supervisors
			// TODO: Validate user exists
			// TODO: Create new supervisor
			// TODO: Return created supervisor
		},
		createSupervisorDto
	)
	
	// Get all supervisors (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading supervisors
		// TODO: Apply role-based filtering
		// TODO: Return filtered supervisors list
	})
	
	// Get a specific supervisor by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific supervisor
		// TODO: Find supervisor by ID
		// TODO: Return supervisor details with populated relationships
	})
	
	// Update a supervisor
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this supervisor
			// TODO: Find and update supervisor
			// TODO: Return updated supervisor
		},
		updateSupervisorDto
	)
	
	// Delete a supervisor
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this supervisor
		// TODO: Check if supervisor has courses (prevent deletion if occupied)
		// TODO: Delete supervisor
		// TODO: Return success message
	});
