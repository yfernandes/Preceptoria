import Elysia from "elysia";

export const usersController = new Elysia({ prefix: "users" })
	.get("/", "Get All")
	.get("/:id", "Get One")
	.post("/", "Create One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
