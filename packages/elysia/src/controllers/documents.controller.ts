import Elysia from "elysia";
import { authMiddleware } from "../middlewares/auth";

export const documentsController = new Elysia({ prefix: "documents" })
	.use(authMiddleware)
	.get("/:id", ({ requester, error }) => {
		try {
			return requester;
		} catch (err) {
			return error(500, { err });
		}
	})
	.post("/", "Create One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
