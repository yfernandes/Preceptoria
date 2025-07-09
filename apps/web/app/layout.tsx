import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata: Metadata = {
	title: "Preceptoria - Sistema de Gestão de Estágios",
	description:
		"Sistema moderno para gestão de estágios e documentação de estudantes",
	generator: "Next.js",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
