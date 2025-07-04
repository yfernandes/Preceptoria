import Elysia, { error, t } from "elysia";
import { Course } from "../entities";
import { db } from "../db";
import { authMiddleware } from "../middlewares/auth";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";
import { UserRoles } from "../entities/role.abstract";

// DTOs for request validation
const createCourseDto = {
	body: t.Object({
		name: t.String(),
		schoolId: t.String(),
		supervisorId: t.String(),
	}),
};

const updateCourseDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		schoolId: t.Optional(t.String()),
		supervisorId: t.Optional(t.String()),
	}),
};

export const coursesController = new Elysia({ prefix: "/courses" })
	.use(authMiddleware)
	
	// Create a new course
	.post(
		"/",
		async ({ body: { name, schoolId, supervisorId }, requester }) => {
			try {
				// Check permissions for creating courses
				const hasAccess = await hasPermission(
					requester,
					Resource.Course,
					Actions.Create,
					""
				);
				
				if (!hasAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to create courses" 
					});
				}
				
				// Validate school exists and user has access to it
				const school = await db.school.findOne({ id: schoolId });
				if (!school) {
					return error(404, { 
						success: false, 
						message: "School not found" 
					});
				}
				
				// Check if user has access to this school
				const hasSchoolAccess = await hasPermission(
					requester,
					Resource.School,
					Actions.Read,
					schoolId
				);
				
				if (!hasSchoolAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to create courses for this school" 
					});
				}
				
				// Validate supervisor exists and user has access to them
				const supervisor = await db.supervisor.findOne({ id: supervisorId });
				if (!supervisor) {
					return error(404, { 
						success: false, 
						message: "Supervisor not found" 
					});
				}
				
				// Check if user has access to this supervisor
				const hasSupervisorAccess = await hasPermission(
					requester,
					Resource.Supervisor,
					Actions.Read,
					supervisorId
				);
				
				if (!hasSupervisorAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to assign this supervisor to the course" 
					});
				}
				
				// Create new course
				const newCourse = new Course(name, school, supervisor);
				
				await db.em.persistAndFlush(newCourse);
				
				// Return created course with populated relationships
				const createdCourse = await db.course.findOne(
					{ id: newCourse.id },
					{ populate: ['school', 'supervisor', 'school.orgAdmin'] }
				);
				
				return {
					success: true,
					data: createdCourse,
					message: "Course created successfully"
				};
			} catch (err) {
				console.error("Error creating course:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createCourseDto
	)
	
	// Get all courses (with optional filtering)
	.get("/", async ({ requester, query }) => {
		try {
			const { schoolId, supervisorId, limit = 10, offset = 0 } = query;
			
			// Build filter based on user permissions and role
			let filter: any = {};
			
			// Apply query filters
			if (schoolId) {
				filter.school = { id: schoolId };
			}
			
			if (supervisorId) {
				filter.supervisor = { id: supervisorId };
			}
			
			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see courses they're enrolled in
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see courses they manage
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see courses with students at their hospital
				// This requires complex filtering based on shift assignments
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all courses within their organization
				// This requires filtering by organization
			}
			
			// Get courses with pagination
			const courses = await db.course.find(filter, {
				populate: ['school', 'supervisor', 'classes'],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: 'DESC' }
			});
			
			// Filter courses based on permissions
			const accessibleCourses = [];
			for (const course of courses) {
				const hasAccess = await hasPermission(
					requester,
					Resource.Course,
					Actions.Read,
					course.id
				);
				
				if (hasAccess) {
					accessibleCourses.push(course);
				}
			}
			
			return {
				success: true,
				data: accessibleCourses,
				pagination: {
					total: accessibleCourses.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleCourses.length === parseInt(limit as string)
				}
			};
		} catch (err) {
			console.error("Error fetching courses:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Get a specific course by ID
	.get("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for reading this specific course
			const hasAccess = await hasPermission(
				requester,
				Resource.Course,
				Actions.Read,
				id
			);
			
			if (!hasAccess) {
				return error(403, { 
					success: false, 
					message: "You don't have permission to view this course" 
				});
			}
			
			// Find course by ID with populated relationships
			const course = await db.course.findOne(
				{ id },
				{ 
					populate: [
						'school', 
						'supervisor', 
						'classes',
						'classes.students',
						'school.orgAdmin'
					] 
				}
			);
			
			if (!course) {
				return error(404, { 
					success: false, 
					message: "Course not found" 
				});
			}
			
			return {
				success: true,
				data: course
			};
		} catch (err) {
			console.error("Error fetching course:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Update a course
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this course
				const hasAccess = await hasPermission(
					requester,
					Resource.Course,
					Actions.Update,
					id
				);
				
				if (!hasAccess) {
					return error(403, { 
						success: false, 
						message: "You don't have permission to update this course" 
					});
				}
				
				// Find course by ID
				const course = await db.course.findOne({ id });
				if (!course) {
					return error(404, { 
						success: false, 
						message: "Course not found" 
					});
				}
				
				// Validate school exists if schoolId is being updated
				if (body.schoolId) {
					const school = await db.school.findOne({ id: body.schoolId });
					if (!school) {
						return error(404, { 
							success: false, 
							message: "School not found" 
						});
					}
					
					// Check if user has access to this school
					const hasSchoolAccess = await hasPermission(
						requester,
						Resource.School,
						Actions.Read,
						body.schoolId
					);
					
					if (!hasSchoolAccess) {
						return error(403, { 
							success: false, 
							message: "You don't have permission to assign this course to the specified school" 
						});
					}
					
					course.school = school;
				}
				
				// Validate supervisor exists if supervisorId is being updated
				if (body.supervisorId) {
					const supervisor = await db.supervisor.findOne({ id: body.supervisorId });
					if (!supervisor) {
						return error(404, { 
							success: false, 
							message: "Supervisor not found" 
						});
					}
					
					// Check if user has access to this supervisor
					const hasSupervisorAccess = await hasPermission(
						requester,
						Resource.Supervisor,
						Actions.Read,
						body.supervisorId
					);
					
					if (!hasSupervisorAccess) {
						return error(403, { 
							success: false, 
							message: "You don't have permission to assign this supervisor to the course" 
						});
					}
					
					course.supervisor = supervisor;
				}
				
				// Update course properties
				if (body.name) {
					course.name = body.name;
				}
				
				await db.em.persistAndFlush(course);
				
				// Return updated course with populated relationships
				const updatedCourse = await db.course.findOne(
					{ id },
					{ populate: ['school', 'supervisor', 'classes', 'school.orgAdmin'] }
				);
				
				return {
					success: true,
					data: updatedCourse,
					message: "Course updated successfully"
				};
			} catch (err) {
				console.error("Error updating course:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateCourseDto
	)
	
	// Delete a course
	.delete("/:id", async ({ params: { id }, requester }) => {
		try {
			// Check permissions for deleting this course
			const hasAccess = await hasPermission(
				requester,
				Resource.Course,
				Actions.Delete,
				id
			);
			
			if (!hasAccess) {
				return error(403, { 
					success: false, 
					message: "You don't have permission to delete this course" 
				});
			}
			
			// Find course by ID with classes
			const course = await db.course.findOne(
				{ id },
				{ populate: ['classes'] }
			);
			
			if (!course) {
				return error(404, { 
					success: false, 
					message: "Course not found" 
				});
			}
			
			// Check if course has classes (prevent deletion if occupied)
			if (course.classes.length > 0) {
				return error(400, { 
					success: false, 
					message: "Cannot delete course that has classes. Please remove or reassign classes first." 
				});
			}
			
			// Delete course
			await db.em.removeAndFlush(course);
			
			return {
				success: true,
				message: "Course deleted successfully"
			};
		} catch (err) {
			console.error("Error deleting course:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
