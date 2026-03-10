"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { signin, loading, error, clearError } = useAuth();
	const router = useRouter();
	const isDevelopment = process.env.NODE_ENV === "development";

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
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
					<CardDescription>Entre com suas credenciais</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="grid gap-6">
							{/* Login social temporariamente desabilitado
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Entrar com Apple
                </Button>
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Entrar com Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Ou continue com
                </span>
              </div>
              */}

							{/* Credenciais de desenvolvimento */}
							{isDevelopment && (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<h4 className="text-sm font-semibold text-blue-900 mb-2">
										🔧 Credenciais de Desenvolvimento
									</h4>
									<div className="text-xs text-blue-700 space-y-1">
										<p>
											<strong>Email:</strong> yagoalmeida@gmail.com
										</p>
										<p>
											<strong>Senha:</strong> TotallyS3cr3tP4ssw_rd
										</p>
									</div>
								</div>
							)}

							<div className="grid gap-6">
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
									<div className="flex items-center">
										<Label htmlFor="password">Senha</Label>
										<a
											href="#"
											className="ml-auto text-sm underline-offset-4 hover:underline"
										>
											Esqueceu sua senha?
										</a>
									</div>
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>

								{error && (
									<div className="bg-red-100 border border-red-300 text-red-800 rounded p-2 text-sm mb-2 text-center">
										{error}
									</div>
								)}

								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? "Entrando..." : "Entrar"}
								</Button>
							</div>
							<div className="text-center text-sm">
								Não tem uma conta?{" "}
								<a href="#" className="underline underline-offset-4">
									Cadastre-se
								</a>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				Ao clicar em continuar, você concorda com nossos{" "}
				<a href="#">Termos de Serviço</a> e{" "}
				<a href="#">Política de Privacidade</a>.
			</div>
		</div>
	);
}
