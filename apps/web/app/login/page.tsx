"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { Alert, AlertDescription } from "@web/components/ui/alert";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { signin, loading, error, clearError } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearError();

		try {
			await signin(email, password);
			// Successful login - redirect to dashboard
			router.push("/dashboard");
		} catch (err) {
			// Error is handled by the auth context
			console.error("Login failed:", err);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 mb-4">
						<GraduationCap className="h-6 w-6 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Preceptoria</h1>
					<p className="mt-2 text-sm text-gray-600">
						Sistema de Gestão de Estágios
					</p>
				</div>

				{/* Login Card */}
				<Card className="shadow-xl">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">Entrar</CardTitle>
						<CardDescription className="text-center">
							Digite suas credenciais para acessar o sistema
							<br />
							Email: yagoalmeida@gmail.com
							<br />
							Senha: TotallyS3cr3tP4ssw_rd
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									data-testid="email"
									name="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="seu@email.com"
									className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Senha</Label>
								<Input
									id="password"
									data-testid="password"
									name="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							{error && (
								<Alert variant="destructive" data-testid="error-message">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<Button
								type="submit"
								data-testid="login-button"
								disabled={loading}
								className="w-full transition-all duration-200 hover:scale-[1.02]"
								size="lg"
							>
								{loading ? "Entrando..." : "Entrar"}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<Link
								href="/"
								className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
							>
								Voltar ao início
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="text-center text-xs text-gray-500">
					<p>© 2024 Preceptoria. Todos os direitos reservados.</p>
				</div>
			</div>
		</div>
	);
}
