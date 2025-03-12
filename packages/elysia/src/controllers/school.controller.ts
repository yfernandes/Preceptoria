import Elysia from "elysia";

export const schoolController = new Elysia({ prefix: "schol" })
	.get("/", "Get All")
	.get("/:id", "Get One")
	.post("/", "Create One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
