import Elysia, { t } from "elysia";
import { SysAdmin } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";

const createSysAdminDto = {
	body: t.Object({
		userId: t.String(),
	}),
};

export const adminController = new Elysia({ prefix: "admin" })
	.use(authMiddleware)
	.post(
		"/",
		async ({ requester, error, body: { userId } }) => {
			try {
				if (!requester.sysAdminId) return error(401);

				const user = await db.user.findOne({ id: userId });
				if (!user) {
					return new Error("User not Found");
				}

				const sysAdmin = new SysAdmin(user);
				await db.em.persistAndFlush(sysAdmin);
				return sysAdmin;
			} catch (err) {
				return error(500, { err });
			}
		},
		createSysAdminDto
	)
	.get("/:id", async ({ requester, error, params: { id } }) => {
		try {
			if (requester.sysAdminId !== id) {
				return error(401);
			}
			// Used only by each SysAdmin
			return await db.sysAdmin.findOne({ id });
		} catch (err) {
			return error(500, { err });
		}
	})
	// .patch("/:id", "Update One") // Nothing to do here since SysAdmins don't have any properties
	.delete("/:id", () => {
		return { success: false, message: "Undefined Behaviour" };
	});
