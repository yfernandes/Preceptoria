"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { AppLoader } from "../../components/AppLoader";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: string[];
}

export function ProtectedRoute({
	children,
	requiredRoles,
}: ProtectedRouteProps) {
	try {
		const { user } = useAuth();
		const router = useRouter();

		useEffect(() => {
			if (!user) {
				router.push("/login");
			}
		}, [user, router]);

		useEffect(() => {
			if (user && requiredRoles && requiredRoles.length > 0) {
				const hasRequiredRole = user.roles.some((role) =>
					requiredRoles.includes(role)
				);
				if (!hasRequiredRole) {
					router.push("/unauthorized");
				}
			}
		}, [user, requiredRoles, router]);

		if (!user) {
			return (
				<AppLoader>
					<div className="flex min-h-screen items-center justify-center">
						<div className="text-center">
							<p className="text-muted-foreground">
								Redirecionando para login...
							</p>
						</div>
					</div>
				</AppLoader>
			);
		}

		if (requiredRoles && requiredRoles.length > 0) {
			const hasRequiredRole = user.roles.some((role) =>
				requiredRoles.includes(role)
			);
			if (!hasRequiredRole) {
				return (
					<AppLoader>
						<div className="flex min-h-screen items-center justify-center">
							<div className="text-center">
								<p className="text-muted-foreground">Redirecionando...</p>
							</div>
						</div>
					</AppLoader>
				);
			}
		}

		return <AppLoader>{children}</AppLoader>;
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
