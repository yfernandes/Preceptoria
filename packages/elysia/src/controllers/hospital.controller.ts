import Elysia from "elysia";

export const hospitalController = new Elysia({ prefix: "hospital" })
	.get("/", "Get All")
	.get("/:id", "Get One")
	.post("/", "Create One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
