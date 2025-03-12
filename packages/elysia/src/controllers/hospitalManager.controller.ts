import Elysia, { t } from "elysia";
import { db } from "../db";
import { HospitalManager } from "../entities";
const createHManagerDto = {
	body: t.Object({
		userId: t.String(),
		hospitalId: t.String(),
	}),
};

export const hospitalManagerController = new Elysia({
	prefix: "hospitalManager",
})
	.post(
		"/",
		async ({ body: { userId, hospitalId } }) => {
			const user = await db.user.findOne({ id: userId });
			if (!user) return new Error("User Could not be found");

			const hospital = await db.hospital.findOne({ id: hospitalId });
			if (!hospital) return new Error("Hospital Could not be found");

			const hManager = new HospitalManager(user, hospital);
			return hManager;
		},
		createHManagerDto
	)
	.get("/", "Get All")
	.get("/:id", "Get One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
