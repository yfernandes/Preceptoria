import { Resend } from "resend"
import { env } from "$env/dynamic/private"

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

const FROM_EMAIL = "Preceptoria <no-reply@preceptoria.com>"

export async function sendInvitationEmail(email: string, token: string, className: string) {
	if (!resend) {
		console.log("Mock Email: Invitation to", email, "token:", token)
		return
	}

	const url = `${env.ORIGIN}/register/${token}`

	await resend.emails.send({
		from: FROM_EMAIL,
		to: email,
		subject: "Convite para ingressar na plataforma Preceptoria",
		html: `
			<h1>Bem-vindo à Preceptoria</h1>
			<p>Você foi convidado para a turma <strong>${className}</strong>.</p>
			<p>Para concluir seu cadastro, clique no link abaixo:</p>
			<a href="${url}">${url}</a>
		`,
	})
}

export async function sendDocumentStatusEmail(
	email: string,
	docName: string,
	status: "APPROVED" | "REJECTED",
	reason?: string
) {
	if (!resend) {
		console.log("Mock Email: Doc Status to", email, status, docName)
		return
	}

	const statusText = status === "APPROVED" ? "Aprovado" : "Rejeitado"
	const color = status === "APPROVED" ? "green" : "red"

	await resend.emails.send({
		from: FROM_EMAIL,
		to: email,
		subject: `Documento ${statusText}: ${docName}`,
		html: `
			<h2>Status do seu documento</h2>
			<p>O documento <strong>${docName}</strong> foi <strong style="color: ${color}">${statusText}</strong>.</p>
			${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ""}
			<p>Acesse a plataforma para mais detalhes.</p>
		`,
	})
}
