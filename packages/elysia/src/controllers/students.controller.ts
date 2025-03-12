import Elysia, { t } from "elysia";
import { Student } from "../entities";
import { db } from "../db";

const createStudentDto = {
	body: t.Object({
		userId: t.String(),
		classId: t.String(),
	}),
};

export const studentsController = new Elysia({ prefix: "students" })
	.post(
		"/",
		async ({ body: { userId, classId } }) => {
			const user = await db.user.findOne({ id: userId });
			if (!user) return new Error("User Not Found!");

			const classes = await db.classes.findOne({ id: classId });
			if (!classes) return new Error("Class Not Found!");

			const preceptor = new Student(user, classes);
			return preceptor;
		},
		createStudentDto
	)
	.get("/", "Get All")
	.get("/:id", "Get One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
