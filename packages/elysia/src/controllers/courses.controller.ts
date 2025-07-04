import Elysia, { t } from "elysia";
import { Course } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createCourseDto = {
	body: t.Object({
		name: t.String(),
		schoolId: t.String(),
		supervisorId: t.String(),
	}),
};

const updateCourseDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		schoolId: t.Optional(t.String()),
		supervisorId: t.Optional(t.String()),
	}),
};

export const coursesController = new Elysia({ prefix: "/courses" })
	.use(authMiddleware)
	
	// Create a new course
	.post(
		"/",
		async ({ body: { name, schoolId, supervisorId }, requester, status }) => {
			// TODO: Check permissions for creating courses
			// TODO: Validate school and supervisor exist
			// TODO: Create new course
			// TODO: Return created course
		},
		createCourseDto
	)
	
	// Get all courses (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading courses
		// TODO: Apply role-based filtering (supervisors see their courses, etc.)
		// TODO: Return filtered courses list
	})
	
	// Get a specific course by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific course
		// TODO: Find course by ID
		// TODO: Return course details with populated relationships
	})
	
	// Update a course
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this course
			// TODO: Find and update course
			// TODO: Return updated course
		},
		updateCourseDto
	)
	
	// Delete a course
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this course
		// TODO: Check if course has classes (prevent deletion if occupied)
		// TODO: Delete course
		// TODO: Return success message
	});
