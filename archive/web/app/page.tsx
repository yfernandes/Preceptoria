import { Calendar, FileText, GraduationCap, Shield } from "lucide-react"
import Link from "next/link"

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-blue-600 p-2 text-white">
								<GraduationCap className="h-6 w-6" />
							</div>
							<h1 className="text-2xl font-bold text-gray-900">Preceptoria</h1>
						</div>
						<Link
							href="/login"
							className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
						>
							Entrar
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="text-center">
					<h2 className="mb-6 text-4xl font-bold text-gray-900">Sistema de Gestão de Estágios</h2>
					<p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
						Gerencie seus documentos, acompanhe seus estágios e mantenha-se organizado durante sua
						jornada acadêmica de forma simples e eficiente.
					</p>

					<Link
						href="/login"
						className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700"
					>
						<GraduationCap className="h-5 w-5" />
						Acessar Sistema
					</Link>
				</div>

				{/* Features */}
				<div className="mt-20 grid gap-8 md:grid-cols-3">
					<div className="rounded-lg bg-white p-6 text-center shadow-sm">
						<div className="mx-auto mb-4 w-fit rounded-lg bg-blue-100 p-3 text-blue-600">
							<FileText className="h-6 w-6" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-gray-900">Gestão de Documentos</h3>
						<p className="text-gray-600">
							Envie e organize seus documentos de estágio de forma segura e organizada.
						</p>
					</div>

					<div className="rounded-lg bg-white p-6 text-center shadow-sm">
						<div className="mx-auto mb-4 w-fit rounded-lg bg-green-100 p-3 text-green-600">
							<Calendar className="h-6 w-6" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-gray-900">Acompanhamento de Estágios</h3>
						<p className="text-gray-600">
							Visualize seus horários, preceptores e locais de estágio em tempo real.
						</p>
					</div>

					<div className="rounded-lg bg-white p-6 text-center shadow-sm">
						<div className="mx-auto mb-4 w-fit rounded-lg bg-purple-100 p-3 text-purple-600">
							<Shield className="h-6 w-6" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-gray-900">Acesso Seguro</h3>
						<p className="text-gray-600">
							Seus dados estão protegidos com criptografia e controle de acesso rigoroso.
						</p>
					</div>
				</div>

				{/* Info Section */}
				<div className="mt-16 rounded-lg bg-white p-8 shadow-sm">
					<h3 className="mb-4 text-center text-2xl font-bold text-gray-900">Como Funciona</h3>
					<div className="grid gap-8 md:grid-cols-2">
						<div>
							<h4 className="mb-3 text-lg font-semibold text-gray-900">Para Estudantes</h4>
							<ul className="space-y-2 text-gray-600">
								<li>• Faça login com suas credenciais acadêmicas</li>
								<li>• Envie seus documentos de estágio</li>
								<li>• Acompanhe o status de validação</li>
								<li>• Visualize seus horários e locais</li>
								<li>• Mantenha contato com preceptores</li>
							</ul>
						</div>
						<div>
							<h4 className="mb-3 text-lg font-semibold text-gray-900">Benefícios</h4>
							<ul className="space-y-2 text-gray-600">
								<li>• Organização automática de documentos</li>
								<li>• Notificações sobre atualizações</li>
								<li>• Acesso 24/7 aos seus dados</li>
								<li>• Interface simples e intuitiva</li>
								<li>• Suporte integrado ao sistema acadêmico</li>
							</ul>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="mt-20 border-t border-gray-200 bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="text-center text-gray-600">
						<p>© 2024 Preceptoria. Sistema de Gestão de Estágios.</p>
						<p className="mt-2 text-sm">
							Desenvolvido para facilitar a jornada acadêmica dos estudantes.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
