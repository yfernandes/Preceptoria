import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as studentService from '$lib/server/db/services/students';
import * as classService from '$lib/server/db/services/classes';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// We'll need classes to assign students to
	const classes = await classService.listClasses();
	
	// For now, list all students. Later we'll filter by organization/class
	const students = await db.query.students.findMany({
		with: {
			user: true,
			class: {
				with: {
					course: true
				}
			}
		}
	});

	return {
		students,
		classes
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const classId = formData.get('classId')?.toString();
		const registrationNumber = formData.get('registrationNumber')?.toString();

		if (!name || !email || !classId) {
			return fail(400, { message: 'Name, Email and Class are required' });
		}

		try {
			// 1. Check if user already exists
			let existingUser = await db.query.user.findFirst({
				where: eq(user.email, email)
			});

			let userId: string;

			if (!existingUser) {
				// Create new user (simplified for MVP admin creation)
				const id = crypto.randomUUID();
				const now = new Date();
				const [newUser] = await db.insert(user).values({
					id,
					name,
					email,
					emailVerified: false,
					createdAt: now,
					updatedAt: now,
					role: 'Student'
				}).returning();
				userId = newUser.id;
			} else {
				userId = existingUser.id;
			}

			// 2. Create student entry
			await studentService.createStudent({
				userId,
				classId,
				registrationNumber
			});

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to create student' });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { message: 'ID is required' });
		}

		try {
			await studentService.deleteStudent(id);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete student' });
		}
	}
};
