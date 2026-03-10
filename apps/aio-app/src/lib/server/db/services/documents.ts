import { db } from '$lib/server/db';
import { documents } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export type DocumentType = 'PROFESSIONAL_ID' | 'VACCINATION_CARD' | 'COMMITMENT_CONTRACT' | 'ADMISSION_FORM' | 'BADGE_PICTURE' | 'INSURANCE_DOCUMENTATION' | 'OTHER';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export async function createDocument(data: {
	studentId: string;
	name: string;
	type: DocumentType;
	url: string;
	mimeType?: string;
	fileSize?: number;
	expiresAt?: Date;
}) {
	const [result] = await db.insert(documents).values(data).returning();
	return result;
}

export async function getDocumentById(id: string) {
	return await db.query.documents.findFirst({
		where: eq(documents.id, id),
		with: {
			student: {
				with: {
					user: true
				}
			}
		}
	});
}

export async function listDocumentsByStudent(studentId: string) {
	return await db.query.documents.findMany({
		where: eq(documents.studentId, studentId),
		with: {
			student: {
				with: {
					user: true
				}
			}
		}
	});
}

export async function updateDocumentStatus(id: string, status: DocumentStatus, verifiedBy: string, rejectionReason?: string) {
	const [result] = await db
		.update(documents)
		.set({
			status,
			verifiedBy,
			verifiedAt: new Date(),
			rejectionReason
		})
		.where(eq(documents.id, id))
		.returning();
	return result;
}

export async function deleteDocument(id: string) {
	const [result] = await db.delete(documents).where(eq(documents.id, id)).returning();
	return result;
}
