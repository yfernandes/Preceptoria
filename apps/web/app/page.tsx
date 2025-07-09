"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { AppLoader } from "../components/AppLoader";

export default function HomePage() {
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		} else {
			router.push("/login");
		}
	}, [user, router]);

	return (
		<AppLoader>
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold">Preceptoria</h1>
					<p className="text-muted-foreground">Redirecionando...</p>
				</div>
			</div>
		</AppLoader>
	);
}
