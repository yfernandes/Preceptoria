import { error, fail } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { students } from "$lib/server/db/schema";
import * as documentService from "$lib/server/db/services/documents";
import * as emailService from "$lib/server/email";
import { getPresignedUploadUrl, getPresignedDownloadUrl } from "$lib/server/r2";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401);

	let studentId: string | undefined;

	if (locals.user.role === "Student") {
		const studentEntry = await db.query.students.findFirst({
			where: eq(students.userId, locals.user.id),
		});
		if (!studentEntry) throw error(404, "Student profile not found");
		studentId = studentEntry.id;
	}

	const rawDocuments = studentId
		? await documentService.listDocumentsByStudent(studentId)
		: await db.query.documents.findMany({
				with: { student: { with: { user: true } } },
			});

	const documents = await Promise.all(
		rawDocuments.map(async (doc) => ({
			...doc,
			downloadUrl: await getPresignedDownloadUrl(doc.url),
		})),
	);

	return {
		documents,
		isStudent: locals.user.role === "Student",
		studentId,
	};
};

export const actions: Actions = {
	getUploadUrl: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const fileName = formData.get("name")?.toString();
		const contentType = formData.get("type")?.toString();
		const documentType = formData.get("documentType")?.toString() as any;
		const studentId = formData.get("studentId")?.toString();
		const fileSize = parseInt(formData.get("size")?.toString() || "0");

		if (!fileName || !contentType || !documentType || !studentId) {
			return fail(400, { message: "Missing required fields" });
		}

		const key = `documents/${studentId}/${crypto.randomUUID()}-${fileName}`;
		const uploadUrl = await getPresignedUploadUrl(key, contentType);

		const doc = await documentService.createDocument({
			studentId,
			name: fileName,
			type: documentType,
			url: key,
			mimeType: contentType,
			fileSize,
		});

		return {
			uploadUrl,
			documentId: doc.id,
			key,
		};
	},

	approve: async ({ request, locals }) => {
		if (!locals.user || locals.user.role === "Student") return fail(403);

		const formData = await request.formData();
		const id = formData.get("id")?.toString();

		if (!id) return fail(400);

		await documentService.updateDocumentStatus(id, "APPROVED", locals.user.id);

		// Send notification
		const doc = await db.query.documents.findFirst({
			where: (d, { eq }) => eq(d.id, id),
			with: { student: { with: { user: true } } }
		});
		if (doc?.student.user.email) {
			await emailService.sendDocumentStatusEmail(doc.student.user.email, doc.name, "APPROVED");
		}

		return { success: true };
	},

	reject: async ({ request, locals }) => {
		if (!locals.user || locals.user.role === "Student") return fail(403);

		const formData = await request.formData();
		const id = formData.get("id")?.toString();
		const reason = formData.get("reason")?.toString();

		if (!id || !reason) return fail(400);

		await documentService.updateDocumentStatus(
			id,
			"REJECTED",
			locals.user.id,
			reason,
		);

		// Send notification
		const doc = await db.query.documents.findFirst({
			where: (d, { eq }) => eq(d.id, id),
			with: { student: { with: { user: true } } }
		});
		if (doc?.student.user.email) {
			await emailService.sendDocumentStatusEmail(doc.student.user.email, doc.name, "REJECTED", reason);
		}

		return { success: true };
	},
};
