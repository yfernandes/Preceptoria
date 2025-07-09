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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = z.object({
	email: z.string().refine((val) => {
		// Allow 'admin' in development or valid email
		if (process.env.NODE_ENV === "development" && val === "admin") {
			return true;
		}
		return z.string().email().safeParse(val).success;
	}, "Email inválido"),
	password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const { signin, loading, error, clearError } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			clearError();
			await signin(data.email, data.password);
			router.push("/dashboard");
		} catch (error) {
			// Error is handled by the auth context
		}
	};

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="text-center text-2xl font-bold">Entrar</CardTitle>
				<CardDescription className="text-center">
					Digite suas credenciais para acessar o sistema
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

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
							<p className="text-sm text-red-500">{errors.email.message}</p>
						)}
						{process.env.NODE_ENV === "development" && (
							<p className="text-xs text-gray-500">
								💡 Dev tip: Use "admin" as email and "admin" as password for
								quick access
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
								{...register("password")}
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
						{errors.password && (
							<p className="text-sm text-red-500">{errors.password.message}</p>
						)}
						{process.env.NODE_ENV === "development" && (
							<p className="text-xs text-gray-500">
								💡 Dev tip: Use "TotallyS3cr3tP4ssw_rd" as password for quick
								access
							</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Entrando...
							</>
						) : (
							"Entrar"
						)}
					</Button>
				</form>

				<div className="mt-4 text-center">
					<p className="text-sm text-gray-600">
						Não tem uma conta?{" "}
						<Button
							variant="link"
							className="h-auto p-0 font-semibold"
							onClick={() => router.push("/signup")}
						>
							Criar conta
						</Button>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
