import Elysia, { t } from "elysia";
import { Preceptor } from "../entities";
import { db } from "../db";

const createPreceptorDto = {
	body: t.Object({
		userId: t.String(),
		hospitalId: t.String(),
	}),
};

export const preceptorController = new Elysia({ prefix: "preceptor" })
	.post(
		"/",
		async ({ body: { userId, hospitalId } }) => {
			const user = await db.user.findOne({ id: userId });
			if (!user) return new Error("User Not Found!");

			const hospital = await db.hospital.findOne({ id: hospitalId });
			if (!hospital) return new Error("hospital Not Found!");

			const preceptor = new Preceptor(user, hospital);
			return preceptor;
		},
		createPreceptorDto
	)
	.get("/:id", "Get One")
	.get("/", "Get All")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
