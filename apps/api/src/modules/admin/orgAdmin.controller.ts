import Elysia, { status as error, t } from "elysia";
import { authenticatedUserMiddleware } from "@api/middleware/authenticatedUser.middleware";
import { OrgAdminService } from "./orgAdmin.service";

const createOrgAdminDto = {
	body: t.Object({
		userId: t.String(),
		hospitalId: t.Optional(t.String()),
		schoolId: t.Optional(t.String()),
	}),
};

const updateOrgAdminDto = {
	body: t.Object({
		hospitalId: t.Optional(t.String()),
		schoolId: t.Optional(t.String()),
	}),
};

const orgAdminService = new OrgAdminService();

export const orgAdminController = new Elysia({ prefix: "/org-admins" })
	.use(authenticatedUserMiddleware)

	// Create a new org admin
	.post(
		"/",
		async ({ body: { userId, hospitalId, schoolId }, requester }) => {
			const result = await orgAdminService.createOrgAdmin(
				requester,
				userId,
				hospitalId,
				schoolId
			);
			if (result.status && result.status !== 201) {
				return error(result.status, { success: false, message: result.error });
			}
			if (!result.orgAdmin) {
				return error(500, {
					success: false,
					message: "Unexpected error: orgAdmin missing",
				});
			}
			return {
				success: true,
				data: result.orgAdmin,
				message: "Org admin created successfully",
			};
		},
		createOrgAdminDto
	)

	// Get all org admins (with optional filtering)
	.get("/", async ({ requester, query }) => {
		const result = await orgAdminService.getOrgAdmins(requester, query);
		return {
			success: true,
			data: result.data,
			pagination: result.pagination,
		};
	})

	// Get a specific org admin by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		const result = await orgAdminService.getOrgAdminById(requester, id);
		if (result.status) {
			return error(result.status, { success: false, message: result.error });
		}
		if (!result.orgAdmin) {
			return error(500, {
				success: false,
				message: "Unexpected error: orgAdmin missing",
			});
		}
		return {
			success: true,
			data: result.orgAdmin,
		};
	})

	// Update an org admin
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			const result = await orgAdminService.updateOrgAdmin(requester, id, body);
			if (result.status) {
				return error(result.status, { success: false, message: result.error });
			}
			if (!result.orgAdmin) {
				return error(500, {
					success: false,
					message: "Unexpected error: orgAdmin missing",
				});
			}
			return {
				success: true,
				data: result.orgAdmin,
				message: "Org admin updated successfully",
			};
		},
		updateOrgAdminDto
	)

	// Delete an org admin
	.delete("/:id", async ({ params: { id }, requester }) => {
		const result = await orgAdminService.deleteOrgAdmin(requester, id);
		if (result.status) {
			return error(result.status, { success: false, message: result.error });
		}
		return {
			success: true,
			message: "Org admin deleted successfully",
		};
	});
