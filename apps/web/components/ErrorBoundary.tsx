"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error?: Error }>;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback;
				return <FallbackComponent error={this.state.error} />;
			}

			return (
				<div className="flex min-h-screen items-center justify-center bg-gray-50">
					<div className="w-full max-w-md p-6">
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								<div className="mt-2">
									<h2 className="text-lg font-semibold text-gray-900">
										Algo deu errado
									</h2>
									<p className="mt-1 text-sm text-gray-600">
										Ocorreu um erro inesperado. Por favor, recarregue a página.
									</p>
									{this.state.error && (
										<details className="mt-3 text-xs text-gray-500">
											<summary className="cursor-pointer">
												Detalhes do erro
											</summary>
											<pre className="mt-2 overflow-auto rounded bg-gray-100 p-2">
												{this.state.error.message}
											</pre>
										</details>
									)}
								</div>
							</AlertDescription>
						</Alert>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
