import Elysia, { status as error, t } from "elysia";
import { Classes } from "./";
import { db } from "@api/db";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import { UserRoles } from "@api/entities/role.abstract";
import { FilterQuery } from "@mikro-orm/postgresql";
import { authenticatedUserMiddleware } from "@api/middlewares/authenticatedUser.middleware";

// DTOs for request validation
const createClassDto = {
	body: t.Object({
		name: t.String(),
		courseId: t.String(),
	}),
};

const updateClassDto = {
	body: t.Object({
		name: t.Optional(t.String()),
		courseId: t.Optional(t.String()),
	}),
};

export const classesController = new Elysia({ prefix: "/classes" })
	.use(authenticatedUserMiddleware)

	// Create a new class
	.post(
		"",
		async ({ body: { name, courseId }, requester }) => {
			try {
				// Check permissions for creating classes
				const hasAccess = await hasPermission(
					requester,
					Resource.Classes,
					Actions.Create,
					""
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to create classes",
					});
				}

				// Validate course exists and user has access to it
				const course = await db.course.findOne({ id: courseId });
				if (!course) {
					return error(404, {
						success: false,
						message: "Course not found",
					});
				}

				// Check if user has access to this course
				const hasCourseAccess = await hasPermission(
					requester,
					Resource.Course,
					Actions.Read,
					courseId
				);

				if (!hasCourseAccess) {
					return error(403, {
						success: false,
						message:
							"You don't have permission to create classes for this course",
					});
				}

				// Create new class
				const newClass = new Classes(name, course);

				await db.em.persistAndFlush(newClass);

				// Return created class with populated relationships
				const createdClass = await db.classes.findOne(
					{ id: newClass.id },
					{ populate: ["course", "course.supervisor", "course.school"] }
				);

				return {
					success: true,
					data: createdClass,
					message: "Class created successfully",
				};
			} catch (err) {
				console.error("Error creating class:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		createClassDto
	)

	// Get all classes (with optional filtering)
	.get("", async ({ requester, query }) => {
		try {
			const { courseId, supervisorId, limit = 10, offset = 0 } = query;

			// Build filter based on user permissions and role
			const filter: FilterQuery<Classes> = {};

			// Apply query filters
			if (courseId) {
				filter.course = { id: courseId };
			}

			if (supervisorId) {
				filter.course = { supervisor: { id: supervisorId } };
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see their own class
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see classes they manage
				// This will be handled by the permission system
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see classes with students at their hospital
				// This requires complex filtering based on shift assignments
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all classes within their organization
				// This requires filtering by organization
			}

			// Get classes with pagination
			const classes = await db.classes.find(filter, {
				populate: ["course", "students"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { createdAt: "DESC" },
			});

			// Filter classes based on permissions
			const accessibleClasses = [];
			for (const classItem of classes) {
				const hasAccess = await hasPermission(
					requester,
					Resource.Classes,
					Actions.Read,
					classItem.id
				);

				if (hasAccess) {
					accessibleClasses.push(classItem);
				}
			}

			return {
				success: true,
				data: accessibleClasses,
				pagination: {
					total: accessibleClasses.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleClasses.length === parseInt(limit as string),
				},
			};
		} catch (err) {
			console.error("Error fetching classes:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Get a specific class by ID
	.get(
		":id",
		async ({ params: { id }, requester }) => {
			try {
				// Check permissions for reading this specific class
				const hasAccess = await hasPermission(
					requester,
					Resource.Classes,
					Actions.Read,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to view this class",
					});
				}

				// Find class by ID with populated relationships
				const classItem = await db.classes.findOne(
					{ id },
					{
						populate: [
							"course",
							"students",
							"course.supervisor",
							"course.school",
						],
					}
				);

				if (!classItem) {
					return error(404, {
						success: false,
						message: "Class not found",
					});
				}

				return {
					success: true,
					data: classItem,
				};
			} catch (err) {
				console.error("Error fetching class:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	)

	// Update a class
	.patch(
		"/:id",
		async ({ params: { id }, body, requester }) => {
			try {
				// Check permissions for updating this class
				const hasAccess = await hasPermission(
					requester,
					Resource.Classes,
					Actions.Update,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to update this class",
					});
				}

				// Find class by ID
				const classItem = await db.classes.findOne({ id });
				if (!classItem) {
					return error(404, {
						success: false,
						message: "Class not found",
					});
				}

				// Validate course exists if courseId is being updated
				if (body.courseId) {
					const course = await db.course.findOne({ id: body.courseId });
					if (!course) {
						return error(404, {
							success: false,
							message: "Course not found",
						});
					}

					// Check if user has access to this course
					const hasCourseAccess = await hasPermission(
						requester,
						Resource.Course,
						Actions.Read,
						body.courseId
					);

					if (!hasCourseAccess) {
						return error(403, {
							success: false,
							message:
								"You don't have permission to assign this class to the specified course",
						});
					}

					classItem.course = course;
				}

				// Update class properties
				if (body.name) {
					classItem.name = body.name;
				}

				await db.em.persistAndFlush(classItem);

				// Return updated class with populated relationships
				const updatedClass = await db.classes.findOne(
					{ id },
					{ populate: ["course", "course.supervisor", "course.school"] }
				);

				return {
					success: true,
					data: updatedClass,
					message: "Class updated successfully",
				};
			} catch (err) {
				console.error("Error updating class:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		updateClassDto
	)

	// Delete a class
	.delete(
		":id",
		async ({ params: { id }, requester }) => {
			try {
				// Check permissions for deleting this class
				const hasAccess = await hasPermission(
					requester,
					Resource.Classes,
					Actions.Delete,
					id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message: "You don't have permission to delete this class",
					});
				}

				// Find class by ID with students
				const classItem = await db.classes.findOne(
					{ id },
					{ populate: ["students"] }
				);

				if (!classItem) {
					return error(404, {
						success: false,
						message: "Class not found",
					});
				}

				// Check if class has students (prevent deletion if occupied)
				if (classItem.students.length > 0) {
					return error(400, {
						success: false,
						message:
							"Cannot delete class that has students. Please reassign or remove students first.",
					});
				}

				// Delete class
				await db.em.removeAndFlush(classItem);

				return {
					success: true,
					message: "Class deleted successfully",
				};
			} catch (err) {
				console.error("Error deleting class:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
