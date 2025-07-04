import Elysia, { error, t } from "elysia";
import { OrgAdmin } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";
import { UserRoles } from "../entities/role.abstract";

// DTOs for request validation
const createOrgAdminDto = {
	body: t.Object({
		userId: t.String(),
		hospitalId: t.Optional(t.String()),
		schoolId: t.Optional(t.String()),
	}),
};

const updateOrgAdminDto = {
	body: t.Object({
		hospitalId: t.Optional(t.String()),
		schoolId: t.Optional(t.String()),
	}),
};

export const orgAdminController = new Elysia({ prefix: "/org-admins" })
	.use(authMiddleware)
	
	// Create a new org admin
	.post(
		"/",
		async ({ body: { userId, hospitalId, schoolId }, requester }) => {
			try {
				// Check permissions for creating org admins
				let hasAccess = false;
				
				if (requester.roles.includes(UserRoles.SysAdmin)) {
					hasAccess = true;
				} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
					// For now, allow OrgAdmins to create other OrgAdmins
					// In a real implementation, you'd check organization boundaries
					hasAccess = true;
				}
				
				if (!hasAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to create org admins" 
					});
				}
				
				// Validate user exists
				const user = await db.user.findOne({ id: userId });
				if (!user) {
					return error(404, { 
						success: false, 
						message: "User not found" 
					});
				}
				
				// Check if user is already an org admin
				const existingOrgAdmin = await db.orgAdmin.findOne({ user: { id: userId } });
				if (existingOrgAdmin) {
					return error(400, { 
						success: false, 
						message: "User is already an org admin" 
					});
				}
				
				// Validate hospital or school exists (at least one must be provided)
				let hospital = null;
				let school = null;
				
				if (hospitalId) {
					hospital = await db.hospital.findOne({ id: hospitalId });
					if (!hospital) {
						return error(404, { 
							success: false, 
							message: "Hospital not found" 
						});
					}
				}
				
				if (schoolId) {
					school = await db.school.findOne({ id: schoolId });
					if (!school) {
						return error(404, { 
							success: false, 
							message: "School not found" 
						});
					}
				}
				
				if (!hospitalId && !schoolId) {
					return error(400, { 
						success: false, 
						message: "Either hospitalId or schoolId must be provided" 
					});
				}
				
				// Create new org admin
				const newOrgAdmin = new OrgAdmin(user);
				if (hospital) {
					newOrgAdmin.hospital = hospital;
				}
				if (school) {
					newOrgAdmin.school = school;
				}
				
				await db.em.persistAndFlush(newOrgAdmin);
				
				// Return created org admin with populated relationships
				const createdOrgAdmin = await db.orgAdmin.findOne(
					{ id: newOrgAdmin.id },
					{ populate: ['user', 'hospital', 'school'] }
				);
				
				return {
					success: true,
					data: createdOrgAdmin,
					message: "Org admin created successfully"
				};
			} catch (err) {
				console.error("Error creating org admin:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createOrgAdminDto
	)
	
	// Get all org admins (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const { hospitalId, schoolId, limit = 10, offset = 0 } = query;
			
			// Build filter based on user permissions and role
			let filter: any = {};
			
			// Apply query filters
			if (hospitalId) {
				filter.hospital = { id: hospitalId };
			}
			
			if (schoolId) {
				filter.school = { id: schoolId };
			}
			
			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students typically don't have access to org admin information
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see org admins of their school
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see org admins of their hospital
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see other org admins within their organization
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.SysAdmin)) {
				// SysAdmins can see all org admins
				// This will be handled by the permission system
			}
			
			// Get org admins with pagination
			const orgAdmins = await db.orgAdmin.find(filter, {
				populate: ['user', 'hospital', 'school'],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: 'DESC' }
			});
			
			// Filter org admins based on permissions
			const accessibleOrgAdmins = [];
			for (const orgAdmin of orgAdmins) {
				// OrgAdmins can be managed by SysAdmins or other OrgAdmins in the same organization
				let hasAccess = false;
				
				if (requester.roles.includes(UserRoles.SysAdmin)) {
					hasAccess = true;
				} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
					// For now, allow OrgAdmins to see other OrgAdmins
					// In a real implementation, you'd check organization boundaries
					hasAccess = true;
				}
				
				if (hasAccess) {
					accessibleOrgAdmins.push(orgAdmin);
				}
			}
			
			return {
				success: true,
				data: accessibleOrgAdmins,
				pagination: {
					total: accessibleOrgAdmins.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleOrgAdmins.length === parseInt(limit as string)
				}
			};
		} catch (err) {
			console.error("Error fetching org admins:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Get a specific org admin by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific org admin
			let hasAccess = false;
			
			if (requester.roles.includes(UserRoles.SysAdmin)) {
				hasAccess = true;
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// For now, allow OrgAdmins to see other OrgAdmins
				// In a real implementation, you'd check organization boundaries
				hasAccess = true;
			}
			
			if (!hasAccess) {
				return error(403, { 
					success: false, 
					message: "You don't have permission to view this org admin" 
				});
			}
			
			// Find org admin by ID with populated relationships
			const orgAdmin = await db.orgAdmin.findOne(
				{ id },
				{ 
					populate: [
						'user', 
						'hospital', 
						'school'
					] 
				}
			);
			
			if (!orgAdmin) {
				return error(404, { 
					success: false, 
					message: "Org admin not found" 
				});
			}
			
			return {
				success: true,
				data: orgAdmin
			};
		} catch (err) {
			console.error("Error fetching org admin:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Update an org admin
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this org admin
				let hasAccess = false;
				
				if (requester.roles.includes(UserRoles.SysAdmin)) {
					hasAccess = true;
				} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
					// For now, allow OrgAdmins to update other OrgAdmins
					// In a real implementation, you'd check organization boundaries
					hasAccess = true;
				}
				
				if (!hasAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to update this org admin" 
					});
				}
				
				// Find org admin by ID
				const orgAdmin = await db.orgAdmin.findOne({ id });
				if (!orgAdmin) {
					return error(404, { 
						success: false, 
						message: "Org admin not found" 
					});
				}
				
				// Update hospital if hospitalId is being updated
				if (body.hospitalId) {
					const hospital = await db.hospital.findOne({ id: body.hospitalId });
					if (!hospital) {
						return error(404, { 
							success: false, 
							message: "Hospital not found" 
						});
					}
					orgAdmin.hospital = hospital;
				}
				
				// Update school if schoolId is being updated
				if (body.schoolId) {
					const school = await db.school.findOne({ id: body.schoolId });
					if (!school) {
						return error(404, { 
							success: false, 
							message: "School not found" 
						});
					}
					orgAdmin.school = school;
				}
				
				await db.em.persistAndFlush(orgAdmin);
				
				// Return updated org admin with populated relationships
				const updatedOrgAdmin = await db.orgAdmin.findOne(
					{ id },
					{ populate: ['user', 'hospital', 'school'] }
				);
				
				return {
					success: true,
					data: updatedOrgAdmin,
					message: "Org admin updated successfully"
				};
			} catch (err) {
				console.error("Error updating org admin:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateOrgAdminDto
	)
	
	// Delete an org admin
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this org admin
			let hasAccess = false;
			
			if (requester.roles.includes(UserRoles.SysAdmin)) {
				hasAccess = true;
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// For now, allow OrgAdmins to delete other OrgAdmins
				// In a real implementation, you'd check organization boundaries
				hasAccess = true;
			}
			
			if (!hasAccess) {
				return error(403, { 
					success: false, 
					message: "You don't have permission to delete this org admin" 
				});
			}
			
			// Find org admin by ID
			const orgAdmin = await db.orgAdmin.findOne({ id });
			if (!orgAdmin) {
				return error(404, { 
					success: false, 
					message: "Org admin not found" 
				});
			}
			
			// Check if this is the last org admin for the organization
			// This is a basic check - in a real implementation, you'd want more sophisticated logic
			if (orgAdmin.hospital) {
				const hospitalOrgAdmins = await db.orgAdmin.count({ hospital: { id: orgAdmin.hospital.id } });
				if (hospitalOrgAdmins <= 1) {
					return error(400, { 
						success: false, 
						message: "Cannot delete the last org admin for this hospital" 
					});
				}
			}
			
			if (orgAdmin.school) {
				const schoolOrgAdmins = await db.orgAdmin.count({ school: { id: orgAdmin.school.id } });
				if (schoolOrgAdmins <= 1) {
					return error(400, { 
						success: false, 
						message: "Cannot delete the last org admin for this school" 
					});
				}
			}
			
			// Delete org admin
			await db.em.removeAndFlush(orgAdmin);
			
			return {
				success: true,
				message: "Org admin deleted successfully"
			};
		} catch (err) {
			console.error("Error deleting org admin:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
