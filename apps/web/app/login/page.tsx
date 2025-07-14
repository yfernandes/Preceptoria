"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";

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
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900">Preceptoria</h1>
					<p className="mt-2 text-sm text-gray-600">
						Sistema de Gestão de Estágios
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email (yagoalmeida@gmail.com)
							</label>
							<input
								id="email"
								data-testid="email"
								name="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
								placeholder="seu@email.com"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Senha (TotallyS3cr3tP4ssw_rd)
							</label>
							<input
								id="password"
								data-testid="password"
								name="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
								placeholder="••••••••"
							/>
						</div>
					</div>

					{error && (
						<div
							data-testid="error-message"
							className="text-center text-sm text-red-600"
						>
							{error}
						</div>
					)}

					<div>
						<button
							type="submit"
							data-testid="login-button"
							disabled={loading}
							className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
						>
							{loading ? "Entrando..." : "Entrar"}
						</button>
					</div>

					<div className="text-center">
						<Link
							href="/"
							className="text-sm text-blue-600 hover:text-blue-500"
						>
							Voltar ao início
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
