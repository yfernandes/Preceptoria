import Elysia, { status as error, t } from "elysia";
import { authenticatedUserMiddleware } from "@api/middleware/authenticatedUser.middleware";
import { ShiftService } from "./shift.service";

// DTOs for request validation
const createShiftDto = {
	body: t.Object({
		date: t.String(), // ISO date string
		startTime: t.String(), // ISO date string
		endTime: t.String(), // ISO date string
		location: t.String(),
		hospitalId: t.String(),
		preceptorId: t.String(),
		studentIds: t.Array(t.String()), // Array of student IDs
	}),
};

const updateShiftDto = {
	body: t.Object({
		date: t.Optional(t.String()),
		startTime: t.Optional(t.String()),
		endTime: t.Optional(t.String()),
		location: t.Optional(t.String()),
		hospitalId: t.Optional(t.String()),
		preceptorId: t.Optional(t.String()),
		studentIds: t.Optional(t.Array(t.String())),
	}),
};

const shiftService = new ShiftService();

export const shiftController = new Elysia({ prefix: "/shifts" })
	.use(authenticatedUserMiddleware)

	// Create a new shift
	.post(
		"/",
		async ({ body, requester }) => {
			const result = await shiftService.createShift(requester, body);
			if (!result.success) {
				return error(result.status, result);
			}
			return {
				success: true,
				data: result.data,
				message: result.message,
			};
		},
		createShiftDto
	)

	// Get all shifts (with optional filtering)
	.get("/", async ({ requester, query }) => {
		const result = await shiftService.getAllShifts(requester, query);
		if (!result.success) {
			return error(result.status, result);
		}
		return {
			success: true,
			data: result.data,
			pagination: result.pagination,
		};
	})

	// Get a specific shift by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		const result = await shiftService.getShiftById(requester, id);
		if (!result.success) {
			return error(result.status, result);
		}
		return {
			success: true,
			data: result.data,
		};
	})

	// Update a shift
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			const result = await shiftService.updateShift(requester, id, body);
			if (!result.success) {
				return error(result.status, result);
			}
			return {
				success: true,
				data: result.data,
				message: result.message,
			};
		},
		updateShiftDto
	)

	// Delete a shift
	.delete("/:id", async ({ params: { id }, requester }) => {
		const result = await shiftService.deleteShift(requester, id);
		if (!result.success) {
			return error(result.status, result);
		}
		return {
			success: true,
			message: result.message,
		};
	});
