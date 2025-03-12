import Elysia from "elysia";

export const courseController = new Elysia({ prefix: "course" })
	.get("/", "Get All")
	.get("/:id", "Get One")
	.post("/", "Create One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
