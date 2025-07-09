"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const signupSchema = z
	.object({
		name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
		email: z.string().email("Email inválido"),
		phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
		password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Senhas não coincidem",
		path: ["confirmPassword"],
	});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState({
		score: 0,
		feedback: "",
	});
	const { signup, loading, error, clearError } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isValid },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		mode: "onChange",
	});

	const watchedPassword = watch("password");

	// Password strength checker
	const checkPasswordStrength = (password: string) => {
		let score = 0;
		let feedback = "";

		if (password.length >= 8) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;

		if (score < 2) feedback = "Muito fraca";
		else if (score < 3) feedback = "Fraca";
		else if (score < 4) feedback = "Média";
		else if (score < 5) feedback = "Forte";
		else feedback = "Muito forte";

		setPasswordStrength({ score, feedback });
	};

	const onSubmit = async (data: SignupFormData) => {
		try {
			clearError();
			const { confirmPassword, ...signupData } = data;
			await signup(signupData);
			router.push("/dashboard");
		} catch (error) {
			// Error is handled by the auth context
		}
	};

	const getPasswordStrengthColor = () => {
		switch (passwordStrength.score) {
			case 0:
			case 1:
				return "text-red-500";
			case 2:
				return "text-orange-500";
			case 3:
				return "text-yellow-500";
			case 4:
				return "text-blue-500";
			case 5:
				return "text-green-500";
			default:
				return "text-gray-500";
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
						<svg
							className="h-8 w-8 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
					</div>
					<h1 className="mt-6 text-3xl font-bold text-gray-900">Preceptoria</h1>
					<p className="mt-2 text-sm text-gray-600">
						Sistema de Gestão de Estágios
					</p>
				</div>

				<Card className="shadow-xl">
					<CardHeader className="space-y-1">
						<CardTitle className="text-center text-2xl font-bold">
							Criar Conta
						</CardTitle>
						<CardDescription className="text-center">
							Preencha os dados para criar sua conta
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<XCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="name">Nome Completo</Label>
								<Input
									id="name"
									type="text"
									placeholder="Seu nome completo"
									{...register("name")}
									className={errors.name ? "border-red-500" : ""}
								/>
								{errors.name && (
									<p className="flex items-center text-sm text-red-500">
										<XCircle className="mr-1 h-3 w-3" />
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="seu@email.com"
									{...register("email")}
									className={errors.email ? "border-red-500" : ""}
								/>
								{errors.email && (
									<p className="flex items-center text-sm text-red-500">
										<XCircle className="mr-1 h-3 w-3" />
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Telefone</Label>
								<Input
									id="phone"
									type="tel"
									placeholder="(11) 99999-9999"
									{...register("phone")}
									className={errors.phone ? "border-red-500" : ""}
								/>
								{errors.phone && (
									<p className="flex items-center text-sm text-red-500">
										<XCircle className="mr-1 h-3 w-3" />
										{errors.phone.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Senha</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										{...register("password", {
											onChange: (e) => checkPasswordStrength(e.target.value),
										})}
										className={errors.password ? "border-red-500" : ""}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								{watchedPassword && (
									<div className="mt-1">
										<div className="flex items-center justify-between text-xs">
											<span className={getPasswordStrengthColor()}>
												Força da senha: {passwordStrength.feedback}
											</span>
											<div className="flex space-x-1">
												{[1, 2, 3, 4, 5].map((level) => (
													<div
														key={level}
														className={`h-1 w-4 rounded-full ${
															level <= passwordStrength.score
																? getPasswordStrengthColor().replace(
																		"text-",
																		"bg-"
																	)
																: "bg-gray-200"
														}`}
													/>
												))}
											</div>
										</div>
									</div>
								)}
								{errors.password && (
									<p className="flex items-center text-sm text-red-500">
										<XCircle className="mr-1 h-3 w-3" />
										{errors.password.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirmar Senha</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="••••••••"
										{...register("confirmPassword")}
										className={errors.confirmPassword ? "border-red-500" : ""}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								{errors.confirmPassword && (
									<p className="flex items-center text-sm text-red-500">
										<XCircle className="mr-1 h-3 w-3" />
										{errors.confirmPassword.message}
									</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={loading || !isValid}
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Criando conta...
									</>
								) : (
									<>
										<CheckCircle className="mr-2 h-4 w-4" />
										Criar Conta
									</>
								)}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Já tem uma conta?{" "}
								<Button
									variant="link"
									className="h-auto p-0 font-semibold text-blue-600 hover:text-blue-800"
									onClick={() => router.push("/login")}
								>
									Fazer login
								</Button>
							</p>
						</div>

						<div className="mt-6 rounded-lg bg-blue-50 p-4">
							<h4 className="mb-2 text-sm font-medium text-blue-900">
								Requisitos da senha:
							</h4>
							<ul className="space-y-1 text-xs text-blue-700">
								<li>• Mínimo de 6 caracteres</li>
								<li>• Recomendado: letras maiúsculas e minúsculas</li>
								<li>• Recomendado: números e símbolos</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
