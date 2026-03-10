import { Classes } from "./classes.entity";
import { db } from "@api/db";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import type { UserContext } from "@api/types/jwtCookie";
import { FilterQuery } from "@mikro-orm/postgresql";

export class ClassesService {
	async createClass(
		requester: UserContext,
		body: { name: string; courseId: string }
	) {
		const hasAccess = await hasPermission(
			requester,
			Resource.Classes,
			Actions.Create,
			""
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to create classes",
			};
		}
		const course = await db.course.findOne({ id: body.courseId });
		if (!course) {
			return {
				status: 404,
				success: false,
				message: "Course not found",
			};
		}
		const hasCourseAccess = await hasPermission(
			requester,
			Resource.Course,
			Actions.Read,
			body.courseId
		);
		if (!hasCourseAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to create classes for this course",
			};
		}
		const newClass = new Classes(body.name, course);
		await db.em.persistAndFlush(newClass);
		const createdClass = await db.classes.findOne(
			{ id: newClass.id },
			{ populate: ["course", "course.supervisor", "course.school"] }
		);
		return {
			success: true,
			data: createdClass,
			message: "Class created successfully",
		};
	}

	async getAllClasses(
		requester: UserContext,
		query: {
			courseId?: string;
			supervisorId?: string;
			limit?: string | number;
			offset?: string | number;
		}
	) {
		const { courseId, supervisorId, limit = 10, offset = 0 } = query;
		const filter: FilterQuery<Classes> = {};
		if (courseId) {
			filter.course = { id: courseId };
		}
		if (supervisorId) {
			filter.course = { supervisor: { id: supervisorId } };
		}
		const classes = await db.classes.find(filter, {
			populate: ["course", "students"],
			limit: parseInt(limit as string),
			offset: parseInt(offset as string),
			orderBy: { createdAt: "DESC" },
		});
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
	}

	async getClassById(requester: UserContext, id: string) {
		const hasAccess = await hasPermission(
			requester,
			Resource.Classes,
			Actions.Read,
			id
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to view this class",
			};
		}
		const classItem = await db.classes.findOne(
			{ id },
			{
				populate: ["course", "students", "course.supervisor", "course.school"],
			}
		);
		if (!classItem) {
			return {
				status: 404,
				success: false,
				message: "Class not found",
			};
		}
		return {
			success: true,
			data: classItem,
		};
	}

	async updateClass(
		requester: UserContext,
		id: string,
		body: { name?: string; courseId?: string }
	) {
		const hasAccess = await hasPermission(
			requester,
			Resource.Classes,
			Actions.Update,
			id
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to update this class",
			};
		}
		const classItem = await db.classes.findOne({ id });
		if (!classItem) {
			return {
				status: 404,
				success: false,
				message: "Class not found",
			};
		}
		if (body.courseId) {
			const course = await db.course.findOne({ id: body.courseId });
			if (!course) {
				return {
					status: 404,
					success: false,
					message: "Course not found",
				};
			}
			const hasCourseAccess = await hasPermission(
				requester,
				Resource.Course,
				Actions.Read,
				body.courseId
			);
			if (!hasCourseAccess) {
				return {
					status: 403,
					success: false,
					message:
						"You don't have permission to assign this class to the specified course",
				};
			}
			classItem.course = course;
		}
		if (body.name) {
			classItem.name = body.name;
		}
		await db.em.persistAndFlush(classItem);
		const updatedClass = await db.classes.findOne(
			{ id },
			{ populate: ["course", "course.supervisor", "course.school"] }
		);
		return {
			success: true,
			data: updatedClass,
			message: "Class updated successfully",
		};
	}

	async deleteClass(requester: UserContext, id: string) {
		const hasAccess = await hasPermission(
			requester,
			Resource.Classes,
			Actions.Delete,
			id
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to delete this class",
			};
		}
		const classItem = await db.classes.findOne(
			{ id },
			{ populate: ["students"] }
		);
		if (!classItem) {
			return {
				status: 404,
				success: false,
				message: "Class not found",
			};
		}
		if (classItem.students.length > 0) {
			return {
				status: 400,
				success: false,
				message:
					"Cannot delete class that has students. Please reassign or remove students first.",
			};
		}
		await db.em.removeAndFlush(classItem);
		return {
			success: true,
			message: "Class deleted successfully",
		};
	}
}
