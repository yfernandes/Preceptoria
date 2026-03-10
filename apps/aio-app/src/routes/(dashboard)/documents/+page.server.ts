import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as documentService from '$lib/server/db/services/documents';
import { getPresignedUploadUrl } from '$lib/server/r2';
import { db } from '$lib/server/db';
import { students } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401);

	let studentId: string | undefined;

	if (locals.user.role === 'Student') {
		const studentEntry = await db.query.students.findFirst({
			where: eq(students.userId, locals.user.id)
		});
		if (!studentEntry) throw error(404, 'Student profile not found');
		studentId = studentEntry.id;
	}

	const documents = studentId 
		? await documentService.listDocumentsByStudent(studentId)
		: await db.query.documents.findMany({ with: { student: { with: { user: true } } } });

	return {
		documents,
		isStudent: locals.user.role === 'Student',
		studentId
	};
};

export const actions: Actions = {
	getUploadUrl: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		
		const formData = await request.formData();
		const fileName = formData.get('name')?.toString();
		const contentType = formData.get('type')?.toString();
		const documentType = formData.get('documentType')?.toString() as any;
		const studentId = formData.get('studentId')?.toString();

		if (!fileName || !contentType || !documentType || !studentId) {
			return fail(400, { message: 'Missing required fields' });
		}

		const key = `documents/${studentId}/${crypto.randomUUID()}-${fileName}`;
		const uploadUrl = await getPresignedUploadUrl(key, contentType);

		// We'll create the document entry in the DB *after* the client uploads to R2
		// or we can create it now as PENDING. Let's create it now.
		const doc = await documentService.createDocument({
			studentId,
			name: fileName,
			type: documentType,
			url: key, // Store the R2 key as the URL base
			mimeType: contentType
		});

		return {
			uploadUrl,
			documentId: doc.id,
			key
		};
	},

	approve: async ({ request, locals }) => {
		if (!locals.user || locals.user.role === 'Student') return fail(403);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) return fail(400);

		await documentService.updateDocumentStatus(id, 'APPROVED', locals.user.id);
		return { success: true };
	},

	reject: async ({ request, locals }) => {
		if (!locals.user || locals.user.role === 'Student') return fail(403);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const reason = formData.get('reason')?.toString();

		if (!id || !reason) return fail(400);

		await documentService.updateDocumentStatus(id, 'REJECTED', locals.user.id, reason);
		return { success: true };
	}
};
