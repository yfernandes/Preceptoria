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

export default function SignupPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Basic validation
		if (formData.password !== formData.confirmPassword) {
			setError("As senhas não coincidem");
			return;
		}

		if (formData.password.length < 6) {
			setError("A senha deve ter pelo menos 6 caracteres");
			return;
		}

		setLoading(true);

		try {
			// TODO: Implement signup logic
			// For now, just simulate a signup process
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Redirect to login page after successful signup
			router.push("/login?message=signup-success");
		} catch (err) {
			setError("Erro ao criar conta. Tente novamente.");
			console.error("Signup failed:", err);
		} finally {
			setLoading(false);
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

				{/* Signup Card */}
				<Card className="shadow-xl">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
						<CardDescription className="text-center">
							Preencha os dados para criar sua conta
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Nome Completo</Label>
								<Input
									id="name"
									data-testid="name"
									name="name"
									type="text"
									required
									value={formData.name}
									onChange={handleChange}
									placeholder="Seu nome completo"
									className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									data-testid="email"
									name="email"
									type="email"
									required
									value={formData.email}
									onChange={handleChange}
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
									value={formData.password}
									onChange={handleChange}
									placeholder="••••••••"
									className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirmar Senha</Label>
								<Input
									id="confirmPassword"
									data-testid="confirm-password"
									name="confirmPassword"
									type="password"
									required
									value={formData.confirmPassword}
									onChange={handleChange}
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
								data-testid="signup-button"
								disabled={loading}
								className="w-full transition-all duration-200 hover:scale-[1.02]"
								size="lg"
							>
								{loading ? "Criando conta..." : "Criar Conta"}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Já tem uma conta?{" "}
								<Link
									href="/login"
									className="text-blue-600 hover:text-blue-500 transition-colors duration-200"
								>
									Entrar
								</Link>
							</p>
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

/* ShadCN Login Form

import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <LoginForm />
      </div>
    </div>
  )
}


*/
