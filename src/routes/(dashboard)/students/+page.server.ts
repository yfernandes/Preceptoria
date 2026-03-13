import { error, fail } from "@sveltejs/kit"
import { and, eq, sql } from "drizzle-orm"
import { db } from "$lib/server/db"
import { classes, students, supervisors, user } from "$lib/server/db/schema"
import * as classService from "$lib/server/db/services/classes"
import * as invitationService from "$lib/server/db/services/invitation"
import * as studentService from "$lib/server/db/services/students"
import * as emailService from "$lib/server/email"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, "Unauthorized")
	}

	let classesList: unknown[] = []
	let supervisor: typeof supervisors.$inferSelect | undefined

	if (locals.user.role === "Supervisor") {
		supervisor = await db.query.supervisors.findFirst({
			where: eq(supervisors.userId, locals.user.id),
		})
		if (!supervisor) throw error(404, "Supervisor not found")

		classesList = await db.query.classes.findMany({
			where: eq(classes.supervisorId, supervisor.id),
			with: {
				course: true,
			},
		})
	} else {
		classesList = await classService.listClasses()
	}

	// List students. If supervisor, only from their classes
	const studentsList = await db.query.students.findMany({
		where: supervisor
			? sql`${students.classId} IN (SELECT id FROM ${classes} WHERE supervisor_id = ${supervisor.id})`
			: undefined,
		with: {
			user: true,
			class: {
				with: {
					course: true,
				},
			},
		},
	})

	// List pending invitations. If supervisor, only for their classes
	const pendingInvitations = await db.query.invitations.findMany({
		where: (i, { eq, and, gt, inArray }) => {
			const baseFilters = [eq(i.status, "PENDING"), gt(i.expiresAt, new Date())]
			if (supervisor) {
				const classIds = classesList.map((c) => c.id)
				if (classIds.length > 0) {
					baseFilters.push(inArray(i.classId, classIds))
				} else {
					// If supervisor has no classes, they shouldn't see any invitations
					baseFilters.push(eq(i.id, "00000000-0000-0000-0000-000000000000"))
				}
			}
			return and(...baseFilters)
		},
		with: {
			class: {
				with: {
					course: true,
				},
			},
		},
	})

	return {
		students: studentsList,
		classes: classesList,
		pendingInvitations,
	}
}

export const actions: Actions = {
	invite: async ({ request, locals }) => {
		if (!locals.user) return fail(401)

		const formData = await request.formData()
		const email = formData.get("email")?.toString()
		const classId = formData.get("classId")?.toString()

		if (!email || !classId) {
			return fail(400, { message: "Email and Class are required" })
		}

		// Only Supervisors and Admins can invite
		if (locals.user.role === "Supervisor") {
			const supervisor = await db.query.supervisors.findFirst({
				where: eq(supervisors.userId, locals.user.id),
			})
			if (!supervisor) return fail(403, { message: "Supervisor not found" })

			const targetClass = await db.query.classes.findFirst({
				where: and(eq(classes.id, classId), eq(classes.supervisorId, supervisor.id)),
			})

			if (!targetClass) {
				return fail(403, { message: "You can only invite students to your own classes" })
			}
		} else if (!["SysAdmin", "OrgAdmin"].includes(locals.user.role)) {
			return fail(403, { message: "Only supervisors and admins can invite students" })
		}

		try {
			// Check if user already exists
			const existingUser = await db.query.user.findFirst({
				where: eq(user.email, email),
			})

			if (existingUser) {
				return fail(400, { message: "A user with this email already exists" })
			}

			// Check if invitation already exists and is pending
			const existingInvite = await db.query.invitations.findFirst({
				where: (i, { eq, and, gt }) =>
					and(eq(i.email, email), eq(i.status, "PENDING"), gt(i.expiresAt, new Date())),
			})

			if (existingInvite) {
				return fail(400, { message: "A pending invitation for this email already exists" })
			}

			const invitation = await invitationService.createInvitation({
				email,
				role: "Student",
				classId,
				invitedBy: locals.user.id,
			})

			const targetClass = await db.query.classes.findFirst({
				where: eq(classes.id, classId),
			})

			await emailService.sendInvitationEmail(
				email,
				invitation.token,
				targetClass?.name || "Sua Turma"
			)

			return { success: true, message: "Invitation sent successfully" }
		} catch (err) {
			console.error(err)
			return fail(500, { message: "Failed to send invitation" })
		}
	},

	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401)

		const formData = await request.formData()
		const name = formData.get("name")?.toString()
		const email = formData.get("email")?.toString()
		const classId = formData.get("classId")?.toString()
		const registrationNumber = formData.get("registrationNumber")?.toString()

		if (!name || !email || !classId) {
			return fail(400, { message: "Name, Email and Class are required" })
		}

		try {
			// 1. Check if user already exists
			const existingUser = await db.query.user.findFirst({
				where: eq(user.email, email),
			})

			let userId: string

			if (!existingUser) {
				// Create new user (simplified for MVP admin creation)
				const id = crypto.randomUUID()
				const now = new Date()
				const [newUser] = await db
					.insert(user)
					.values({
						id,
						name,
						email,
						emailVerified: false,
						createdAt: now,
						updatedAt: now,
						role: "Student",
					})
					.returning()
				userId = newUser.id
			} else {
				userId = existingUser.id
			}

			// 2. Create student entry
			await studentService.createStudent({
				userId,
				classId,
				registrationNumber,
			})

			return { success: true }
		} catch (err) {
			console.error(err)
			return fail(500, { message: "Failed to create student" })
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401)

		const formData = await request.formData()
		const id = formData.get("id")?.toString()

		if (!id) {
			return fail(400, { message: "ID is required" })
		}

		try {
			await studentService.deleteStudent(id)
			return { success: true }
		} catch (err) {
			console.error(err)
			return fail(500, { message: "Failed to delete student" })
		}
	},
}
