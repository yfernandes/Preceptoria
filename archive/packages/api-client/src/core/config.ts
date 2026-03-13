/**
 * API Client Configuration
 *
 * Configuration interface and environment-based configuration.
 */

export interface RetryConfig {
	maxRetries: number
	retryDelay: number // in ms
	retryStatusCodes: number[]
}

export interface ApiClientConfig {
	baseUrl: string
	defaultHeaders?: Record<string, string>
	timeout?: number
	retryConfig?: RetryConfig
}

/**
 * Get the API base URL from environment variables or fallback.
 */
export function getApiBaseUrl(): string {
	// In a real app, you might use process.env or import.meta.env
	// Here we use a placeholder for demonstration
	const nodeUrl =
		typeof process !== "undefined" && typeof process.env !== "undefined"
			? process.env.API_BASE_URL
			: undefined
	const browserUrl =
		typeof window !== "undefined" ? (window as { API_BASE_URL?: string }).API_BASE_URL : undefined
	return nodeUrl ?? browserUrl ?? "http://localhost:3000/api"
}
