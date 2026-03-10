import Elysia, { status as error, t } from "elysia";
import { DocumentType } from "@api/modules/documents";
import { authenticatedUserMiddleware } from "@api/middleware/authenticatedUser.middleware";
import { DocumentService } from "./document.service";

const documentValidationDto = {
	body: t.Object({
		validationChecks: t.Record(t.String(), t.Boolean()),
		notes: t.Optional(t.String()),
	}),
	params: t.Object({
		id: t.String(),
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

const documentService = new DocumentService();

export const documentsController = new Elysia({ prefix: "/documents" })
	.use(authenticatedUserMiddleware)

	// Create a new document
	.post(
		"",
		async ({ requester, body }) => {
			const result = await documentService.createDocument(
				requester,
				body.name,
				body.type,
				body.studentId,
				body.url,
				body.notes
			);
			if (result.status && result.status !== 201) {
				return error(result.status, { success: false, message: result.error });
			}
			if (!result.document) {
				return error(500, {
					success: false,
					message: "Unexpected error: document missing",
				});
			}
			return {
				success: true,
				message: "Document created successfully",
				data: result.document.toPOJO(),
			};
		},
		{
			body: t.Object({
				name: t.String(),
				type: t.Enum(DocumentType),
				studentId: t.String(),
				url: t.String(),
				notes: t.Optional(t.String()),
			}),
		}
	)

	// Get all documents (filtered by permissions)
	.get("", async ({ requester, query }) => {
		const result = await documentService.getDocuments(requester, query);
		return {
			success: true,
			data: result.data,
			pagination: result.pagination,
		};
	})

	// Get a specific document
	.get(
		":id",
		async ({ params, requester }) => {
			const result = await documentService.getDocumentById(
				requester,
				params.id
			);
			if (result.status) {
				return error(result.status, { success: false, message: result.error });
			}
			if (!result.document) {
				return error(500, {
					success: false,
					message: "Unexpected error: document missing",
				});
			}
			return {
				success: true,
				data: {
					document: result.document.toPOJO(),
					validationTemplate: documentService
						.getValidationTemplates()
						.find((t) => t.type === result.document.type)?.template,
				},
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	)

	// Update validation checks
	.patch(
		":id/validation",
		async ({ params, requester, body }) => {
			const result = await documentService.updateValidation(
				requester,
				params.id,
				body.validationChecks,
				body.notes
			);
			if (result.status) {
				return error(result.status, { success: false, message: result.error });
			}
			if (!result.document) {
				return error(500, {
					success: false,
					message: "Unexpected error: document missing",
				});
			}
			return {
				success: true,
				message: "Validation checks updated successfully",
				data: result.document.toPOJO(),
			};
		},
		documentValidationDto
	)

	// Approve document
	.post(
		"/:id/approve",
		async ({ params, requester, body }) => {
			const result = await documentService.approveDocument(
				requester,
				params.id,
				body.notes
			);
			if (result.status) {
				return error(result.status, { success: false, message: result.error });
			}
			if (!result.document) {
				return error(500, {
					success: false,
					message: "Unexpected error: document missing",
				});
			}
			return {
				success: true,
				message: "Document approved successfully",
				data: result.document.toPOJO(),
			};
		},
		documentApprovalDto
	)

	// Reject document
	.post(
		"/:id/reject",
		async ({ params, requester, body }) => {
			const result = await documentService.rejectDocument(
				requester,
				params.id,
				body.reason,
				body.notes
			);
			if (result.status) {
				return error(result.status, { success: false, message: result.error });
			}
			if (!result.document) {
				return error(500, {
					success: false,
					message: "Unexpected error: document missing",
				});
			}
			return {
				success: true,
				message: "Document rejected successfully",
				data: result.document.toPOJO(),
			};
		},
		documentRejectionDto
	)

	// Get validation templates
	.get("/validation-templates", () => {
		return {
			success: true,
			data: documentService.getValidationTemplates(),
		};
	})

	// Compile student documents into bundles (Supervisor only)
	.post(
		"/compile",
		async ({ requester, body }) => {
			const result = await documentService.compileBundle(
				requester,
				body.studentIds,
				body.bundleName,
				body.notes
			);
			if (result.status) {
				return error(result.status, { success: false, message: result.error });
			}
			return {
				success: true,
				message: "Document bundle compiled successfully",
				data: result.bundle,
			};
		},
		{
			body: t.Object({
				studentIds: t.Array(t.String()),
				bundleName: t.String(),
				notes: t.Optional(t.String()),
			}),
		}
	)

	// Get pending documents count (for dashboard)
	.get("/stats/pending", async () => {
		const stats = await documentService.getStats();
		return {
			success: true,
			data: stats,
		};
	});
