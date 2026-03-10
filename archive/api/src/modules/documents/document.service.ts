import { db } from "@api/db";
import { Document, DocumentStatus, DocumentType } from "@api/modules/documents";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import { getValidationTemplateForDocument } from "@api/utils/validationTemplates";
import { UserContext } from "@api/types/jwtCookie";
import { FilterQuery } from "@mikro-orm/postgresql";

export class DocumentService {
	async createDocument(
		requester: UserContext,
		name: string,
		type: DocumentType,
		studentId: string,
		url: string,
		notes?: string
	) {
		const hasAccess = await hasPermission(
			requester,
			Resource.Document,
			Actions.Create,
			studentId
		);
		if (!hasAccess)
			return {
				status: 403,
				error:
					"Access denied. You don't have permission to create documents for this student.",
			};

		const student = await db.student.findOne({ id: studentId });
		if (!student) return { status: 404, error: "Student not found" };

		const user = await db.user.findOne({ id: requester.id });
		if (!user) return { status: 404, error: "User not found" };

		const document = new Document(name, type, url, student, notes);
		await db.em.persistAndFlush(document);
		return { status: 201, document };
	}

	async getDocuments(
		requester: UserContext,
		query: {
			status?: string;
			studentId?: string;
			type?: string;
			limit?: string | number;
			offset?: string | number;
		}
	) {
		const { status, studentId, type, limit = 10, offset = 0 } = query;
		const filter: FilterQuery<Document> = {};
		if (status) filter.status = status as DocumentStatus;
		if (type) filter.type = type as DocumentType;
		if (studentId) filter.student = { id: studentId };
		if (requester.roles.includes("Student")) {
			filter.student = { id: requester.id };
		}
		const documents = await db.document.find(filter, {
			populate: ["student", "verifiedBy"],
			limit: typeof limit === "string" ? parseInt(limit) : limit,
			offset: typeof offset === "string" ? parseInt(offset) : offset,
			orderBy: { uploadedAt: "DESC" },
		});
		const accessibleDocuments = [];
		for (const document of documents) {
			const hasAccess = await hasPermission(
				requester,
				Resource.Document,
				Actions.Read,
				document.id
			);
			if (hasAccess) accessibleDocuments.push(document);
		}
		return {
			data: accessibleDocuments.map((doc) => doc.toPOJO()),
			pagination: {
				total: accessibleDocuments.length,
				limit: typeof limit === "string" ? parseInt(limit) : limit,
				offset: typeof offset === "string" ? parseInt(offset) : offset,
				hasMore:
					accessibleDocuments.length ===
					(typeof limit === "string" ? parseInt(limit) : limit),
			},
		};
	}

	async getDocumentById(requester: UserContext, id: string) {
		const document = await db.document.findOne(
			{ id },
			{ populate: ["student", "verifiedBy"] }
		);
		if (!document) return { status: 404, error: "Document not found" };
		const hasAccess = await hasPermission(
			requester,
			Resource.Document,
			Actions.Read,
			id
		);
		if (!hasAccess)
			return {
				status: 403,
				error:
					"Access denied. You don't have permission to view this document.",
			};
		return { document };
	}

	async updateValidation(
		requester: UserContext,
		id: string,
		validationChecks: Record<string, boolean>,
		notes?: string
	) {
		const document = await db.document.findOne({ id });
		if (!document) return { status: 404, error: "Document not found" };
		const hasAccess = await hasPermission(
			requester,
			Resource.Document,
			Actions.Update,
			id
		);
		if (!hasAccess)
			return {
				status: 403,
				error:
					"Access denied. You don't have permission to update this document.",
			};
		document.updateValidationChecks(validationChecks);
		if (notes) document.validationNotes = notes;
		await db.em.persistAndFlush(document);
		return { document };
	}

	async approveDocument(requester: UserContext, id: string, notes?: string) {
		const document = await db.document.findOne({ id });
		if (!document) return { status: 404, error: "Document not found" };
		const hasAccess = await hasPermission(
			requester,
			Resource.Document,
			Actions.Approve,
			id
		);
		if (!hasAccess)
			return {
				status: 403,
				error: "Access denied. Only hospital managers can approve documents.",
			};
		if (!document.canBeVerified())
			return { status: 400, error: "Document cannot be approved" };
		const user = await db.user.findOne({ id: requester.id });
		if (!user) return { status: 404, error: "User not found" };
		document.approve(user, notes);
		await db.em.persistAndFlush(document);
		return { document };
	}

	async rejectDocument(
		requester: UserContext,
		id: string,
		reason: string,
		notes?: string
	) {
		const document = await db.document.findOne({ id });
		if (!document) return { status: 404, error: "Document not found" };
		const hasAccess = await hasPermission(
			requester,
			Resource.Document,
			Actions.Approve,
			id
		);
		if (!hasAccess)
			return {
				status: 403,
				error: "Access denied. Only hospital managers can reject documents.",
			};
		if (!document.canBeVerified())
			return { status: 400, error: "Document cannot be rejected" };
		const user = await db.user.findOne({ id: requester.id });
		if (!user) return { status: 404, error: "User not found" };
		document.reject(user, reason, notes);
		await db.em.persistAndFlush(document);
		return { document };
	}

	getValidationTemplates() {
		return Object.values(DocumentType).map((type) => ({
			type,
			template: getValidationTemplateForDocument(type),
		}));
	}

	async compileBundle(
		requester: UserContext,
		studentIds: string[],
		bundleName: string,
		notes?: string
	) {
		const hasAccess = await hasPermission(
			requester,
			Resource.Document,
			Actions.Compile,
			studentIds.join(",")
		);
		if (!hasAccess)
			return {
				status: 403,
				error:
					"Access denied. You don't have permission to compile documents for these students.",
			};
		const documents = await db.document.find(
			{
				student: { $in: studentIds },
				status: DocumentStatus.APPROVED,
			},
			{ populate: ["student"] }
		);
		if (documents.length === 0)
			return {
				status: 400,
				error: "No approved documents found for the specified students.",
			};
		const bundle = {
			id: `bundle-${Date.now().toString()}`,
			name: bundleName,
			notes,
			createdAt: new Date(),
			createdBy: requester.id,
			studentCount: studentIds.length,
			documentCount: documents.length,
			documents: documents.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				studentName: doc.student.user.name,
			})),
		};
		return { bundle };
	}

	async getStats() {
		const pendingCount = await db.document.count({
			status: DocumentStatus.PENDING,
		});
		const approvedCount = await db.document.count({
			status: DocumentStatus.APPROVED,
		});
		const rejectedCount = await db.document.count({
			status: DocumentStatus.REJECTED,
		});
		return {
			pending: pendingCount,
			approved: approvedCount,
			rejected: rejectedCount,
			total: pendingCount + approvedCount + rejectedCount,
		};
	}
}
