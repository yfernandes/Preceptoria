import Elysia, { status as error, t } from "elysia";
import { db } from "@api/db";
import { Document, DocumentStatus, DocumentType } from "@api/modules/documents";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import { getValidationTemplateForDocument } from "@api/utils/validationTemplates";
import { UserRoles } from "@api/modules/common/";
import { FilterQuery } from "@mikro-orm/postgresql";
import { authenticatedUserMiddleware } from "@api/middleware/authenticatedUser.middleware";

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
	.use(authenticatedUserMiddleware)

	// Create a new document
	.post(
		"/",
		async ({ requester, body }) => {
			try {
				const { name, type, studentId, url, notes } = body;

				// Check if user can create documents for this student
				const hasAccess = await hasPermission(
					requester,
					Resource.Document,
					Actions.Create,
					studentId // Using studentId as the resource context
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"Access denied. You don't have permission to create documents for this student.",
					});
				}

				// Get the student
				const student = await db.student.findOne({ id: studentId });
				if (!student) {
					return error(404, { success: false, message: "Student not found" });
				}

				// Get the user who is creating the document
				const user = await db.user.findOne({ id: requester.id });
				if (!user) {
					return error(404, { success: false, message: "User not found" });
				}

				// Create the document
				const document = new Document(
					name,
					type,
					url,
					student,
					notes // description parameter
				);

				await db.em.persistAndFlush(document);

				return {
					success: true,
					message: "Document created successfully",
					data: document.toPOJO(),
				};
			} catch (err) {
				console.error("Error creating document:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
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
	.get("/", async ({ requester, query }) => {
		try {
			const { status, studentId, type, limit = 10, offset = 0 } = query;

			// Build filter based on user permissions and role
			const filter: FilterQuery<Document> = {};

			// Apply query filters
			if (status) {
				filter.status = status as DocumentStatus;
			}

			if (type) {
				filter.type = type as DocumentType;
			}

			if (studentId) {
				filter.student = { id: studentId };
			}

			// Apply role-based filtering for data isolation
			if (requester.roles.includes(UserRoles.Student)) {
				// Students can only see their own documents
				filter.student = { id: requester.id };
			} else if (requester.roles.includes(UserRoles.Supervisor)) {
				// Supervisors can see documents from their students
				// This will be handled by the permission system in the query
				// For now, we'll get all documents and filter by permission check
			} else if (requester.roles.includes(UserRoles.HospitalManager)) {
				// HospitalManagers can see documents from students with shifts at their hospital
				// This requires complex filtering based on shift assignments
			} else if (requester.roles.includes(UserRoles.OrgAdmin)) {
				// OrgAdmins can see all documents within their organization
				// This requires filtering by organization
			}

			// Get documents with pagination
			const documents = await db.document.find(filter, {
				populate: ["student", "verifiedBy"],
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				orderBy: { uploadedAt: "DESC" },
			});

			// Filter documents based on permissions
			const accessibleDocuments = [];
			for (const document of documents) {
				const hasAccess = await hasPermission(
					requester,
					Resource.Document,
					Actions.Read,
					document.id
				);

				if (hasAccess) {
					accessibleDocuments.push(document.toPOJO());
				}
			}

			return {
				success: true,
				data: accessibleDocuments,
				pagination: {
					total: accessibleDocuments.length,
					limit: parseInt(limit as string),
					offset: parseInt(offset as string),
					hasMore: accessibleDocuments.length === parseInt(limit as string),
				},
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
				{ populate: ["student", "verifiedBy"] }
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
			console.log(hasAccess);
			if (!hasAccess) {
				return error(403, {
					success: false,
					message:
						"Access denied. You don't have permission to view this document.",
				});
			}
			// Get validation template for this document type
			const validationTemplate = getValidationTemplateForDocument(
				document.type
			);

			return {
				success: true,
				data: {
					document: document.toPOJO() as unknown as Document,
					validationTemplate,
				},
			};
		} catch (err) {
			console.error("Error fetching document:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	}) // Throws error

	// Update validation checks
	.patch(
		"/:id/validation",
		async ({ params, requester, body }) => {
			try {
				const document = await db.document.findOne({ id: params.id });

				if (!document) {
					return error(404, { success: false, message: "Document not found" });
				}

				// Check permissions - Supervisors can update documents on behalf of students
				const hasAccess = await hasPermission(
					requester,
					Resource.Document,
					Actions.Update,
					params.id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"Access denied. You don't have permission to update this document.",
					});
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
					data: document.toPOJO(),
				};
			} catch (err) {
				console.error("Error updating validation checks:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		documentValidationDto
	)

	// Approve document
	.post(
		"/:id/approve",
		async ({ params, requester, body }) => {
			try {
				const document = await db.document.findOne({ id: params.id });

				if (!document) {
					return error(404, { success: false, message: "Document not found" });
				}

				// Check permissions - Only HospitalManagers can approve documents (Approve_Bundle permission)
				const hasAccess = await hasPermission(
					requester,
					Resource.Document,
					Actions.Approve,
					params.id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"Access denied. Only hospital managers can approve documents.",
					});
				}

				if (!document.canBeVerified()) {
					return error(400, {
						success: false,
						message: "Document cannot be approved",
					});
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
					data: document.toPOJO(),
				};
			} catch (err) {
				console.error("Error approving document:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		documentApprovalDto
	)

	// Reject document
	.post(
		"/:id/reject",
		async ({ params, requester, body }) => {
			try {
				const document = await db.document.findOne({ id: params.id });

				if (!document) {
					return error(404, { success: false, message: "Document not found" });
				}

				// Check permissions - Only HospitalManagers can reject documents (Approve_Bundle permission)
				const hasAccess = await hasPermission(
					requester,
					Resource.Document,
					Actions.Approve,
					params.id
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"Access denied. Only hospital managers can reject documents.",
					});
				}

				if (!document.canBeVerified()) {
					return error(400, {
						success: false,
						message: "Document cannot be rejected",
					});
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
					data: document.toPOJO(),
				};
			} catch (err) {
				console.error("Error rejecting document:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
		},
		documentRejectionDto
	)

	// Get validation templates
	.get("/validation-templates", () => {
		try {
			const templates = Object.values(DocumentType).map((type) => ({
				type,
				template: getValidationTemplateForDocument(type),
			}));

			return {
				success: true,
				data: templates,
			};
		} catch (err) {
			console.error("Error fetching validation templates:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	})

	// Compile student documents into bundles (Supervisor only)
	.post(
		"/compile",
		async ({ requester, body }) => {
			try {
				const { studentIds, bundleName, notes } = body;

				// Check if user can compile documents for these students
				// This uses the Compile_Students permission
				const hasAccess = await hasPermission(
					requester,
					Resource.Document,
					Actions.Compile,
					studentIds.join(",") // Using student IDs as resource context
				);

				if (!hasAccess) {
					return error(403, {
						success: false,
						message:
							"Access denied. You don't have permission to compile documents for these students.",
					});
				}

				// Get all documents for the specified students
				const documents = await db.document.find(
					{
						student: { $in: studentIds },
						status: DocumentStatus.APPROVED, // Only include approved documents
					},
					{ populate: ["student"] }
				);

				if (documents.length === 0) {
					return error(400, {
						success: false,
						message: "No approved documents found for the specified students.",
					});
				}

				// Create bundle metadata (in a real implementation, this would create a zip file)
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

				return {
					success: true,
					message: "Document bundle compiled successfully",
					data: bundle,
				};
			} catch (err) {
				console.error("Error compiling document bundle:", err);
				return error(500, { success: false, message: "Internal server error" });
			}
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
		try {
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
				success: true,
				data: {
					pending: pendingCount,
					approved: approvedCount,
					rejected: rejectedCount,
					total: pendingCount + approvedCount + rejectedCount,
				},
			};
		} catch (err) {
			console.error("Error fetching document stats:", err);
			return error(500, { success: false, message: "Internal server error" });
		}
	});
