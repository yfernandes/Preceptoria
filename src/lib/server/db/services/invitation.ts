import { eq } from "drizzle-orm"
import { db } from "$lib/server/db"
import { invitations } from "$lib/server/db/schema"

export async function createInvitation(data: {
	email: string
	role: "Student" | "Preceptor" | "Supervisor" | "HospitalManager"
	classId?: string
	hospitalId?: string
	invitedBy: string
}) {
	const token = crypto.randomUUID()
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

	const [invitation] = await db
		.insert(invitations)
		.values({
			email: data.email,
			role: data.role,
			classId: data.classId,
			hospitalId: data.hospitalId,
			invitedBy: data.invitedBy,
			token,
			expiresAt: expiresAt,
			status: "PENDING",
		})
		.returning()

	return invitation
}

export async function getInvitationByToken(token: string) {
	return await db.query.invitations.findFirst({
		where: (i, { eq, and, gt }) =>
			and(eq(i.token, token), eq(i.status, "PENDING"), gt(i.expiresAt, new Date())),
		with: {
			class: {
				with: {
					course: true,
				},
			},
			inviter: true,
		},
	})
}

export async function acceptInvitation(id: string) {
	await db.update(invitations).set({ status: "ACCEPTED" }).where(eq(invitations.id, id))
}
