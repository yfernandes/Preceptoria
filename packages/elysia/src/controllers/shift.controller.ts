import Elysia, { t } from "elysia";
import { Shift } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createShiftDto = {
	body: t.Object({
		startTime: t.String(), // ISO date string
		endTime: t.String(), // ISO date string
		hospitalId: t.String(),
		preceptorId: t.String(),
		studentId: t.String(),
	}),
};

const updateShiftDto = {
	body: t.Object({
		startTime: t.Optional(t.String()),
		endTime: t.Optional(t.String()),
		hospitalId: t.Optional(t.String()),
		preceptorId: t.Optional(t.String()),
		studentId: t.Optional(t.String()),
	}),
};

export const shiftController = new Elysia({ prefix: "/shifts" })
	.use(authMiddleware)
	
	// Create a new shift
	.post(
		"/",
		async ({ body: { startTime, endTime, hospitalId, preceptorId, studentId }, requester, status }) => {
			// TODO: Check permissions for creating shifts
			// TODO: Validate hospital, preceptor, and student exist
			// TODO: Check for time conflicts
			// TODO: Create new shift
			// TODO: Return created shift
		},
		createShiftDto
	)
	
	// Get all shifts (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading shifts
		// TODO: Apply role-based filtering (students see their shifts, preceptors see their shifts, etc.)
		// TODO: Return filtered shifts list
	})
	
	// Get a specific shift by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific shift
		// TODO: Find shift by ID
		// TODO: Return shift details with populated relationships
	})
	
	// Update a shift
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this shift
			// TODO: Find and update shift
			// TODO: Return updated shift
		},
		updateShiftDto
	)
	
	// Delete a shift
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this shift
		// TODO: Delete shift
		// TODO: Return success message
	});
