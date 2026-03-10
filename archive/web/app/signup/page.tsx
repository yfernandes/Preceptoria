import { GraduationCap } from "lucide-react";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
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
						Crie sua conta para acessar o sistema
					</p>
				</div>

				{/* Signup Form */}
				<SignupForm />

				{/* Footer */}
				<div className="text-center text-xs text-gray-500">
					<p>©2024 Preceptoria. Todos os direitos reservados.</p>
				</div>
			</div>
		</div>
	);
}
