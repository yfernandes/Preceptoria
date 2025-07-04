import Elysia, { t } from "elysia";
import { School } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createSchoolDto = {
	body: t.Object({
		name: t.String(),
		address: t.String(),
		orgAdminId: t.String(),
	}),
};

const updateSchoolDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		address: t.Optional(t.String()),
		orgAdminId: t.Optional(t.String()),
	}),
};

export const schoolController = new Elysia({ prefix: "/schools" })
	.use(authMiddleware)
	
	// Create a new school
	.post(
		"/",
		async ({ body: { name, address, orgAdminId }, requester, status }) => {
			// TODO: Check permissions for creating schools
			// TODO: Validate org admin exists
			// TODO: Create new school
			// TODO: Return created school
		},
		createSchoolDto
	)
	
	// Get all schools (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading schools
		// TODO: Apply role-based filtering (org admins see their schools, etc.)
		// TODO: Return filtered schools list
	})
	
	// Get a specific school by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific school
		// TODO: Find school by ID
		// TODO: Return school details with populated relationships
	})
	
	// Update a school
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this school
			// TODO: Find and update school
			// TODO: Return updated school
		},
		updateSchoolDto
	)
	
	// Delete a school
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this school
		// TODO: Check if school has courses (prevent deletion if occupied)
		// TODO: Delete school
		// TODO: Return success message
	});
