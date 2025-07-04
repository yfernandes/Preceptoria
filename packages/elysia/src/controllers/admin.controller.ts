import Elysia, { t } from "elysia";
import { SysAdmin } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { SyncService } from "../services/syncService";

const createSysAdminDto = {
	body: t.Object({
		userId: t.String(),
	}),
};

const SPREADSHEET_ID = "1gc4rKU34e6KHl34NgpAt-0uZD0gDmEEnOm2-1-o2gt0";
const syncService = new SyncService();

export const adminController = new Elysia({ prefix: "admin" })
	.use(authMiddleware)
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
	.post("/sync-google-sheets", async ({ requester, status }) => {
		if (!requester.sysAdminId) return status(401, { error: "Unauthorized" });
		const result = await syncService.syncFromGoogleSheets(SPREADSHEET_ID);
		return result;
	})
	.get("/:id", async ({ requester, status, params: { id } }) => {
		try {
			if (requester.sysAdminId !== id) {
				return status(401);
			}
			// Used only by each SysAdmin
			return await db.sysAdmin.findOne({ id });
		} catch (err) {
			return status(500, { err });
		}
	})
	// .patch("/:id", "Update One") // Nothing to do here since SysAdmins don't have any properties
	.delete("/:id", () => {
		return { success: false, message: "Undefined Behaviour" };
	});
