/**
 * API Client Configuration
 *
 * Configuration interface and environment-based configuration.
 */

export interface RetryConfig {
	maxRetries: number;
	retryDelay: number; // in ms
	retryStatusCodes: number[];
}

export interface ApiClientConfig {
	baseUrl: string;
	defaultHeaders?: Record<string, string>;
	timeout?: number;
	retryConfig?: RetryConfig;
}

/**
 * Get the API base URL from environment variables or fallback.
 */
export function getApiBaseUrl(): string {
	// In a real app, you might use process.env or import.meta.env
	// Here we use a placeholder for demonstration
	return (
		(typeof process !== "undefined" && process.env.API_BASE_URL) ||
		(typeof window !== "undefined" && (window as any).API_BASE_URL) ||
		"http://localhost:3000/api"
	);
}
