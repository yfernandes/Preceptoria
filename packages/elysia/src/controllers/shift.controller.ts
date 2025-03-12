import Elysia from "elysia";

export const shiftsController = new Elysia({ prefix: "shift" })
	.get("/", "Get All")
	.get("/:id", "Get One")
	.post("/", "Create One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
