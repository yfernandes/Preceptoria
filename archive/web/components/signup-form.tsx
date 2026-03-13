"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [localError, setLocalError] = useState<string | null>(null)
	const { loading, error, clearError } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		clearError()
		setLocalError(null)

		if (password !== confirmPassword) {
			setLocalError("As senhas não coincidem.")
			return
		}

		try {
			// TODO: Implement signup logic in AuthContext and call it here
			// await signup(name, email, password)
			// router.push("/dashboard")
			alert("Signup logic not implemented yet.")
		} catch (err) {
			// Error is handled by the auth context
			console.error("Signup failed:", err)
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Criar conta</CardTitle>
					<CardDescription>Preencha os campos para se cadastrar</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="grid gap-6">
							{localError && (
								<div className="mb-2 rounded border border-red-300 bg-red-100 p-2 text-center text-sm text-red-800">
									{localError}
								</div>
							)}
							{error && (
								<div className="mb-2 rounded border border-red-300 bg-red-100 p-2 text-center text-sm text-red-800">
									{error}
								</div>
							)}
							<div className="grid gap-3">
								<Label htmlFor="name">Nome completo</Label>
								<Input
									id="name"
									type="text"
									placeholder="Seu nome"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="seu@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="password">Senha</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="confirmPassword">Confirmar senha</Label>
								<Input
									id="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? "Criando conta..." : "Criar conta"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
			<div className="text-muted-foreground mt-2 text-center text-xs">
				Já tem uma conta?{" "}
				<a href="/login" className="underline underline-offset-4">
					Entrar
				</a>
			</div>
		</div>
	)
}
