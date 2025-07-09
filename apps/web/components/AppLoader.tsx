"use client";

import { useAuth } from "../contexts/AuthContext";

export function AppLoader({ children }: { children: React.ReactNode }) {
	try {
		const { loading } = useAuth();

		if (loading) {
			return (
				<div className="bg-background flex min-h-screen items-center justify-center">
					<div className="flex flex-col items-center space-y-4">
						<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
						<p className="text-muted-foreground">Carregando...</p>
					</div>
				</div>
			);
		}

		return <>{children}</>;
	} catch (error) {
		// If useAuth throws an error (context not available), show loading
		return (
			<div className="bg-background flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p className="text-muted-foreground">Inicializando...</p>
				</div>
			</div>
		);
	}
}
