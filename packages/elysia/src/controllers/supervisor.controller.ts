import Elysia, { t } from "elysia";
import { Supervisor } from "../entities";
import { db } from "../db";

const createSupervisorDto = {
	body: t.Object({
		userId: t.String(),
		schoolId: t.String(),
	}),
};

export const supervisorsController = new Elysia({ prefix: "supervisors" })
	.post(
		"/",
		async ({ body: { userId, schoolId } }) => {
			const user = await db.user.findOne({ id: userId });
			if (!user) return new Error("User Not Found!");

			const school = await db.school.findOne({ id: schoolId });
			if (!school) return new Error("School Not Found!");

			const supervisor = new Supervisor(user, school);
			return supervisor;
		},
		createSupervisorDto
	)
	.get("/", "Get All")
	.get("/:id", "Get One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
