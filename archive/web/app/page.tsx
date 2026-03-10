import { GraduationCap, FileText, Calendar, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center gap-3">
							<div className="bg-blue-600 text-white p-2 rounded-lg">
								<GraduationCap className="h-6 w-6" />
							</div>
							<h1 className="text-2xl font-bold text-gray-900">Preceptoria</h1>
						</div>
						<Link
							href="/login"
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
						>
							Entrar
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center">
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						Sistema de Gestão de Estágios
					</h2>
					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
						Gerencie seus documentos, acompanhe seus estágios e mantenha-se
						organizado durante sua jornada acadêmica de forma simples e
						eficiente.
					</p>

					<Link
						href="/login"
						className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
					>
						<GraduationCap className="h-5 w-5" />
						Acessar Sistema
					</Link>
				</div>

				{/* Features */}
				<div className="mt-20 grid md:grid-cols-3 gap-8">
					<div className="bg-white p-6 rounded-lg shadow-sm text-center">
						<div className="bg-blue-100 text-blue-600 p-3 rounded-lg w-fit mx-auto mb-4">
							<FileText className="h-6 w-6" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Gestão de Documentos
						</h3>
						<p className="text-gray-600">
							Envie e organize seus documentos de estágio de forma segura e
							organizada.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-sm text-center">
						<div className="bg-green-100 text-green-600 p-3 rounded-lg w-fit mx-auto mb-4">
							<Calendar className="h-6 w-6" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Acompanhamento de Estágios
						</h3>
						<p className="text-gray-600">
							Visualize seus horários, preceptores e locais de estágio em tempo
							real.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-sm text-center">
						<div className="bg-purple-100 text-purple-600 p-3 rounded-lg w-fit mx-auto mb-4">
							<Shield className="h-6 w-6" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Acesso Seguro
						</h3>
						<p className="text-gray-600">
							Seus dados estão protegidos com criptografia e controle de acesso
							rigoroso.
						</p>
					</div>
				</div>

				{/* Info Section */}
				<div className="mt-16 bg-white rounded-lg shadow-sm p-8">
					<h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
						Como Funciona
					</h3>
					<div className="grid md:grid-cols-2 gap-8">
						<div>
							<h4 className="text-lg font-semibold text-gray-900 mb-3">
								Para Estudantes
							</h4>
							<ul className="space-y-2 text-gray-600">
								<li>• Faça login com suas credenciais acadêmicas</li>
								<li>• Envie seus documentos de estágio</li>
								<li>• Acompanhe o status de validação</li>
								<li>• Visualize seus horários e locais</li>
								<li>• Mantenha contato com preceptores</li>
							</ul>
						</div>
						<div>
							<h4 className="text-lg font-semibold text-gray-900 mb-3">
								Benefícios
							</h4>
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
			<footer className="bg-gray-50 border-t border-gray-200 mt-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center text-gray-600">
						<p>© 2024 Preceptoria. Sistema de Gestão de Estágios.</p>
						<p className="mt-2 text-sm">
							Desenvolvido para facilitar a jornada acadêmica dos estudantes.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
