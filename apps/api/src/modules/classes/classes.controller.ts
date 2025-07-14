import Elysia, { status as error, t } from "elysia";
import { authenticatedUserMiddleware } from "@api/middleware/authenticatedUser.middleware";
import { ClassesService } from "./classes.service";

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

const classesService = new ClassesService();

export const classesController = new Elysia({ prefix: "/classes" })
	.use(authenticatedUserMiddleware)

	// Create a new class
	.post(
		"",
		async ({ body, requester }) => {
			const result = await classesService.createClass(requester, body);
			if (!result.success) {
				return error(result.status ?? 500, {
					success: false,
					message: result.message,
				});
			}
			return {
				success: true,
				data: result.data,
				message: result.message,
			};
		},
		createClassDto
	)

	// Get all classes (with optional filtering)
	.get("", async ({ requester, query }) => {
		const result = await classesService.getAllClasses(requester, query);
		return {
			success: true,
			data: result.data,
			pagination: result.pagination,
		};
	})

	// Get a specific class by ID
	.get(
		":id",
		async ({ params: { id }, requester }) => {
			const result = await classesService.getClassById(requester, id);
			if (!result.success) {
				return error(result.status ?? 500, result);
			}
			return {
				success: true,
				data: result.data,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	)

	// Update a class
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			const result = await classesService.updateClass(requester, id, body);
			if (!result.success) {
				return error(result.status ?? 500, result);
			}
			return {
				success: true,
				data: result.data,
				message: result.message,
			};
		},
		updateClassDto
	)

	// Delete a class
	.delete(
		":id",
		async ({ params: { id }, requester }) => {
			const result = await classesService.deleteClass(requester, id);
			if (!result.success) {
				return error(result.status ?? 500, result);
			}
			return {
				success: true,
				message: result.message,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
