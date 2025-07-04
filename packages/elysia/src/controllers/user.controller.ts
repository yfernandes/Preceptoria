import Elysia, { status as error, t } from "elysia";
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
		async ({ body: { name, email, phone, password }, requester }) => {
			try {
				// Check permissions for creating users
				const hasAccess = await hasPermission(
					requester,
					Resource.User,
					Actions.Create,
					""
				);
				
				if (!hasAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to create users" 
					});
				}
				
				// Check if email already exists
				const existingUser = await db.user.findOne({ email });
				if (existingUser) {
					return error(409, { 
						success: false, 
						message: "A user with this email already exists" 
					});
				}
				
				// Create new user
				const user = await User.create(name, email, phone, password);
				await db.em.persistAndFlush(user);
				
				// Return created user (without password)
				const { passwordHash, ...userWithoutPassword } = user;
				return {
					success: true,
					message: "User created successfully",
					data: userWithoutPassword
				};
			} catch (err) {
				console.error("Error creating user:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createUserDto
	)
	
	// Get all users (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const { limit = 10, offset = 0 } = query;
			
			// Check permissions for reading users
			const hasAccess = await hasPermission(
				requester,
				Resource.User,
				Actions.Read,
				""
			);
			
			if (!hasAccess) {
				return error(403, { 
					success: false, 
					message: "You don't have permission to view users" 
				});
			}
			
			// Get users with pagination (excluding passwords)
			const users = await db.user.find({}, {
				fields: ['id', 'name', 'email', 'phoneNumber', 'roles', 'createdAt', 'updatedAt'],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: 'DESC' }
			});
			
			return {
				success: true,
				data: users,
				pagination: {
					total: users.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: users.length === parseInt(limit as string)
				}
			};
		} catch (err) {
			console.error("Error fetching users:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Get a specific user by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific user
			const hasAccess = await hasPermission(
				requester,
				Resource.User,
				Actions.Read,
				id
			);
			
			if (!hasAccess) {
				return error(403, { 
					success: false, 
					message: "You don't have permission to view this user" 
				});
			}
			
			// Find user by ID (excluding password)
			const user = await db.user.findOne(
				{ id },
				{ 
					fields: ['id', 'name', 'email', 'phoneNumber', 'roles', 'createdAt', 'updatedAt'],
					populate: ['sysAdmin', 'orgAdmin', 'supervisor', 'hospitalManager', 'preceptor', 'student']
				}
			);
			
			if (!user) {
				return error(404, { success: false, message: "User not found" });
			}
			
			return {
				success: true,
				data: user
			};
		} catch (err) {
			console.error("Error fetching user:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Update a user
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this user
				const hasAccess = await hasPermission(
					requester,
					Resource.User,
					Actions.Update,
					id
				);
				
				if (!hasAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to update this user" 
					});
				}
				
				// Find user by ID
				const user = await db.user.findOne({ id });
				if (!user) {
					return error(404, { success: false, message: "User not found" });
				}
				
				// Check if email is being updated and if it already exists
				if (body.email && body.email !== user.email) {
					const existingUser = await db.user.findOne({ email: body.email });
					if (existingUser) {
						return error(409, { 
							success: false, 
							message: "A user with this email already exists" 
						});
					}
				}
				
				// Update user fields
				if (body.name) user.name = body.name;
				if (body.email) user.email = body.email;
				if (body.phone) user.phoneNumber = body.phone;
				if (body.password) {
					user.passwordHash = Bun.password.hashSync(body.password);
				}
				
				await db.em.persistAndFlush(user);
				
				// Return updated user (without password)
				const { passwordHash, ...userWithoutPassword } = user;
				return {
					success: true,
					message: "User updated successfully",
					data: userWithoutPassword
				};
			} catch (err) {
				console.error("Error updating user:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateUserDto
	)
	
	// Delete a user
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this user
			const hasAccess = await hasPermission(
				requester,
				Resource.User,
				Actions.Delete,
				id
			);
			
			if (!hasAccess) {
				return error(403, { 
					success: false, 
					message: "You don't have permission to delete this user" 
				});
			}
			
			// Find user by ID with all relationships
			const user = await db.user.findOne(
				{ id },
				{ 
					populate: ['sysAdmin', 'orgAdmin', 'supervisor', 'hospitalManager', 'preceptor', 'student']
				}
			);
			
			if (!user) {
				return error(404, { success: false, message: "User not found" });
			}
			
			// Check if user has associated roles (prevent deletion if has roles)
			if (user.sysAdmin || user.orgAdmin || user.supervisor || 
				user.hospitalManager || user.preceptor || user.student) {
				return error(400, { 
					success: false, 
					message: "Cannot delete user with associated roles. Please remove roles first." 
				});
			}
			
			// Delete user
			await db.em.removeAndFlush(user);
			
			return {
				success: true,
				message: "User deleted successfully"
			};
		} catch (err) {
			console.error("Error deleting user:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	}) as any
