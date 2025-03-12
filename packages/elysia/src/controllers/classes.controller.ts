import Elysia from "elysia";

export const classesController = new Elysia({ prefix: "classes" })
	.get("/", "Get All")
	.get("/:id", "Get One")
	.post("/", "Create One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
