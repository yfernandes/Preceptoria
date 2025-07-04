import Elysia, { t } from "elysia";
import { User } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";

// DTOs for request validation
const createUserDto = {
	body: t.Object({
		name: t.String(),
		email: t.String({ format: "email" }),
		phone: t.String(),
		password: t.String({ minLength: 6 }),
	}),
};

const updateUserDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		email: t.Optional(t.String({ format: "email" })),
		phone: t.Optional(t.String()),
		password: t.Optional(t.String({ minLength: 6 })),
	}),
};

export const userController = new Elysia({ prefix: "/users" })
	.use(authMiddleware)
	
	// Create a new user
	.post(
		"/",
		async ({ body: { name, email, phone, password }, requester, status }) => {
			// TODO: Check permissions for creating users
			// TODO: Check if email already exists
			// TODO: Create new user
			// TODO: Return created user (without password)
		},
		createUserDto
	)
	
	// Get all users (with optional filtering)
	.get("/", async ({ requester, status }) => {
		// TODO: Check permissions for reading users
		// TODO: Apply role-based filtering
		// TODO: Return filtered users list (without passwords)
	})
	
	// Get a specific user by ID
	.get("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for reading this specific user
		// TODO: Find user by ID
		// TODO: Return user details (without password)
	})
	
	// Update a user
	.patch(
		"/:id",
		async ({ params: { id }, body, requester, status }) => {
			// TODO: Check permissions for updating this user
			// TODO: Find and update user
			// TODO: Return updated user (without password)
		},
		updateUserDto
	)
	
	// Delete a user
	.delete("/:id", async ({ params: { id }, requester, status }) => {
		// TODO: Check permissions for deleting this user
		// TODO: Check if user has associated roles (prevent deletion if has roles)
		// TODO: Delete user
		// TODO: Return success message
	});
