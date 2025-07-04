import Elysia, { error, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { db } from "../db";
import { Document, DocumentStatus, DocumentType } from "../entities/document.entity";
import { hasPermission } from "../utils/hasPermissions";
import { Actions, Resource } from "../utils/permissions";
import { getValidationTemplateForDocument } from "../utils/validationTemplates";

const documentValidationDto = {
	body: t.Object({
		validationChecks: t.Record(t.String(), t.Boolean()),
		notes: t.Optional(t.String()),
	}),
};

const documentApprovalDto = {
	body: t.Object({
		notes: t.Optional(t.String()),
	}),
};

const documentRejectionDto = {
	body: t.Object({
		reason: t.String(),
		notes: t.Optional(t.String()),
	}),
};

export const documentsController = new Elysia({ prefix: "/documents" })
	.use(authMiddleware)
	
	// Get all documents (filtered by permissions)
	.get("/", async ({ requester, query }) => {
		try {
			const { status, studentId, type, limit = 10, offset = 0 } = query;
			
			// Build filter based on user permissions
			const filter: any = {};
			
			if (status) {
				filter.status = status;
			}
			
			if (type) {
				filter.type = type;
			}
			
			if (studentId) {
				filter.student = { id: studentId };
			}
			
			// Get documents with pagination
			const documents = await db.document.find(filter, {
				populate: ['student', 'verifiedBy'],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { uploadedAt: 'DESC' }
			});
			
			const total = await db.document.count(filter);
			
			return {
				success: true,
				data: documents,
				pagination: {
					total,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: total > parseInt(offset as string) + documents.length
				}
			};
		} catch (err) {
			console.error("Error fetching documents:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Get a specific document
	.get("/:id", async ({ params, requester }) => {
		try {
			const document = await db.document.findOne(
				{ id: params.id },
				{ populate: ['student', 'verifiedBy'] }
			);
			
			if (!document) {
				return error(404, { success: false, message: "Document not found" });
			}
			
			// Check permissions
			const hasAccess = await hasPermission(
				requester,
				Resource.Document,
				Actions.Read,
				params.id
			);
			
			if (!hasAccess) {
				return error(403, { success: false, message: "Access denied" });
			}
			
			// Get validation template for this document type
			const validationTemplate = getValidationTemplateForDocument(document.type);
			
			return {
				success: true,
				data: {
					...document,
					validationTemplate
				}
			};
		} catch (err) {
			console.error("Error fetching document:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Update validation checks
	.patch("/:id/validation", async ({ params, requester, body }) => {
		try {
			const document = await db.document.findOne({ id: params.id });
			
			if (!document) {
				return error(404, { success: false, message: "Document not found" });
			}
			
			// Check permissions
			const hasAccess = await hasPermission(
				requester,
				Resource.Document,
				Actions.Update,
				params.id
			);
			
			if (!hasAccess) {
				return error(403, { success: false, message: "Access denied" });
			}
			
			// Update validation checks
			document.updateValidationChecks(body.validationChecks);
			if (body.notes) {
				document.validationNotes = body.notes;
			}
			
			await db.em.persistAndFlush(document);
			
			return {
				success: true,
				message: "Validation checks updated successfully",
				data: document
			};
		} catch (err) {
			console.error("Error updating validation checks:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	}, documentValidationDto)
	
	// Approve document
	.post("/:id/approve", async ({ params, requester, body }) => {
		try {
			const document = await db.document.findOne({ id: params.id });
			
			if (!document) {
				return error(404, { success: false, message: "Document not found" });
			}
			
			// Check permissions
			const hasAccess = await hasPermission(
				requester,
				Resource.Document,
				Actions.Update,
				params.id
			);
			
			if (!hasAccess) {
				return error(403, { success: false, message: "Access denied" });
			}
			
			if (!document.canBeVerified()) {
				return error(400, { success: false, message: "Document cannot be approved" });
			}
			
			// Get the actual User entity
			const user = await db.user.findOne({ id: requester.id });
			if (!user) {
				return error(404, { success: false, message: "User not found" });
			}
			
			// Approve document
			document.approve(user, body.notes);
			
			await db.em.persistAndFlush(document);
			
			return {
				success: true,
				message: "Document approved successfully",
				data: document
			};
		} catch (err) {
			console.error("Error approving document:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	}, documentApprovalDto)
	
	// Reject document
	.post("/:id/reject", async ({ params, requester, body }) => {
		try {
			const document = await db.document.findOne({ id: params.id });
			
			if (!document) {
				return error(404, { success: false, message: "Document not found" });
			}
			
			// Check permissions
			const hasAccess = await hasPermission(
				requester,
				Resource.Document,
				Actions.Update,
				params.id
			);
			
			if (!hasAccess) {
				return error(403, { success: false, message: "Access denied" });
			}
			
			if (!document.canBeVerified()) {
				return error(400, { success: false, message: "Document cannot be rejected" });
			}
			
			// Get the actual User entity
			const user = await db.user.findOne({ id: requester.id });
			if (!user) {
				return error(404, { success: false, message: "User not found" });
			}
			
			// Reject document
			document.reject(user, body.reason, body.notes);
			
			await db.em.persistAndFlush(document);
			
			return {
				success: true,
				message: "Document rejected successfully",
				data: document
			};
		} catch (err) {
			console.error("Error rejecting document:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	}, documentRejectionDto)
	
	// Get validation templates
	.get("/validation-templates", async () => {
		try {
			const templates = Object.values(DocumentType).map(type => ({
				type,
				template: getValidationTemplateForDocument(type)
			}));
			
			return {
				success: true,
				data: templates
			};
		} catch (err) {
			console.error("Error fetching validation templates:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})
	
	// Get pending documents count (for dashboard)
	.get("/stats/pending", async ({ requester }) => {
		try {
			const pendingCount = await db.document.count({ status: DocumentStatus.PENDING });
			const approvedCount = await db.document.count({ status: DocumentStatus.APPROVED });
			const rejectedCount = await db.document.count({ status: DocumentStatus.REJECTED });
			
			return {
				success: true,
				data: {
					pending: pendingCount,
					approved: approvedCount,
					rejected: rejectedCount,
					total: pendingCount + approvedCount + rejectedCount
				}
			};
		} catch (err) {
			console.error("Error fetching document stats:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
