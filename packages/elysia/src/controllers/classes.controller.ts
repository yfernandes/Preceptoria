import Elysia, { t } from "elysia";
import { Classes } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createClassDto = {
	body: t.Object({
		name: t.String(),
		courseId: t.String(),
	}),
};

const updateClassDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		courseId: t.Optional(t.String()),
	}),
};

export const classesController = new Elysia({ prefix: "/classes" })
	.use(authMiddleware)
	
	// Create a new class
	.post(
		"/",
		async ({ body: { name, courseId }, requester, status }) => {
			// TODO: Check permissions for creating classes
			// TODO: Validate course exists
			// TODO: Create new class
			// TODO: Return created class
		},
		createClassDto
	)
	
	// Get all classes (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading classes
		// TODO: Apply role-based filtering (supervisors see their classes, etc.)
		// TODO: Return filtered classes list
	})
	
	// Get a specific class by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific class
		// TODO: Find class by ID
		// TODO: Return class details with populated relationships
	})
	
	// Update a class
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this class
			// TODO: Find and update class
			// TODO: Return updated class
		},
		updateClassDto
	)
	
	// Delete a class
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this class
		// TODO: Check if class has students (prevent deletion if occupied)
		// TODO: Delete class
		// TODO: Return success message
	});
