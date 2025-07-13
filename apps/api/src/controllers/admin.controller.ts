import Elysia, { t } from "elysia";
import { SysAdmin } from "../entities";
import { db } from "../db";
import { SyncService } from "../services/syncService";
import { authenticatedUserMiddleware } from "@api/middlewares/authenticatedUser.middleware";

const createSysAdminDto = {
	body: t.Object({
		userId: t.String(),
	}),
};

const syncService = new SyncService();

export const adminController = new Elysia({ prefix: "admin" })
	.use(authenticatedUserMiddleware)
	.post(
		"/",
		async ({ requester, status, body: { userId } }) => {
			try {
				if (!requester.sysAdminId) return status(401);

				const user = await db.user.findOne({ id: userId });
				if (!user) {
					return new Error("User not Found");
				}

				const sysAdmin = new SysAdmin(user);
				await db.em.persistAndFlush(sysAdmin);
				return sysAdmin;
			} catch (err) {
				return status(500, { err });
			}
		},
		createSysAdminDto
	)
	.post("/syncGoogleSheets", async ({ requester, status }) => {
		if (!requester.sysAdminId) return status(401, { error: "Unauthorized" });
		const result = await syncService.syncFromGoogleSheets(
			Bun.env.GOOGLE_SPREADSHEET_ID
		);
		return result;
	})
	.get(
		":id",
		async ({ requester, status, params: { id } }) => {
			try {
				if (requester.sysAdminId !== id) {
					return status(401);
				}
				// Used only by each SysAdmin
				return await db.sysAdmin.findOne({ id });
			} catch (err) {
				return status(500, { err });
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	)
	// .patch("/:id", "Update One") // Nothing to do here since SysAdmins don't have any properties
	.delete(":id", () => {
		return { success: false, message: "Undefined Behaviour" };
	});
