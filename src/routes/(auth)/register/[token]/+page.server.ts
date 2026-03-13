import { error, fail } from "@sveltejs/kit"
import { auth } from "$lib/server/auth"
import { acceptInvitation, getInvitationByToken } from "$lib/server/db/services/invitation"
import * as studentService from "$lib/server/db/services/students"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
	const invitation = await getInvitationByToken(params.token)

	if (!invitation) {
		throw error(404, "Convite não encontrado ou expirado")
	}

	return {
		invitation,
	}
}

export const actions: Actions = {
	default: async ({ request, params }) => {
		const invitation = await getInvitationByToken(params.token)
		if (!invitation) return fail(404, { message: "Convite inválido" })

		const formData = await request.formData()
		const name = formData.get("name")?.toString()
		const password = formData.get("password")?.toString()
		const confirmPassword = formData.get("confirmPassword")?.toString()

		if (!name || !password) {
			return fail(400, { message: "Nome e senha são obrigatórios" })
		}

		if (password !== confirmPassword) {
			return fail(400, { message: "As senhas não coincidem" })
		}

		try {
			// 1. Create the user using Better Auth
			const newUser = await auth.api.signUpEmail({
				body: {
					email: invitation.email,
					password,
					name,
					role: invitation.role,
				},
			})

			if (!newUser) {
				return fail(500, { message: "Falha ao criar usuário" })
			}

			// 2. Create student entry if role is Student
			if (invitation.role === "Student" && invitation.classId) {
				await studentService.createStudent({
					userId: newUser.user.id,
					classId: invitation.classId,
				})
			}

			// 3. Mark invitation as accepted
			await acceptInvitation(invitation.id)

			return { success: true }
		} catch (err: unknown) {
			console.error("Registration error:", err)
			const message = err instanceof Error ? err.message : "Falha no cadastro"
			return fail(500, { message })
		}
	},
}
