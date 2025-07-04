import Elysia, { t } from "elysia";
import { OrgAdmin } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createOrgAdminDto = {
	body: t.Object({
		userId: t.String(),
		organizationId: t.String(),
		role: t.String(),
	}),
};

const updateOrgAdminDto = {
	body: t.Object({
		organizationId: t.Optional(t.String()),
		role: t.Optional(t.String()),
	}),
};

export const orgAdminController = new Elysia({ prefix: "/org-admins" })
	.use(authMiddleware)
	
	// Create a new org admin
	.post(
		"/",
		async ({ body: { userId, organizationId, role }, requester, status }) => {
			// TODO: Check permissions for creating org admins
			// TODO: Validate user and organization exist
			// TODO: Create new org admin
			// TODO: Return created org admin
		},
		createOrgAdminDto
	)
	
	// Get all org admins (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading org admins
		// TODO: Apply role-based filtering
		// TODO: Return filtered org admins list
	})
	
	// Get a specific org admin by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific org admin
		// TODO: Find org admin by ID
		// TODO: Return org admin details with populated relationships
	})
	
	// Update an org admin
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this org admin
			// TODO: Find and update org admin
			// TODO: Return updated org admin
		},
		updateOrgAdminDto
	)
	
	// Delete an org admin
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this org admin
		// TODO: Check if org admin has associated organizations (prevent deletion if occupied)
		// TODO: Delete org admin
		// TODO: Return success message
	});
