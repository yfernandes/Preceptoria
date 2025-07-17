/**
 * Endpoint Definitions
 *
 * Type-safe definitions of API endpoints with request/response types.
 */

export interface EndpointDefinition<TRequest, TResponse> {
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	url: string | ((params: TRequest) => string);
	headers?: Record<string, string>;
	cacheConfig?: CacheConfig;
}

export interface CacheConfig {
	enabled: boolean;
	ttl?: number;
	invalidateOn?: string[];
}

export * from "./responseParsing";
export * from "./factory";
// Example usage to reference type parameters and avoid linter error:
// type ExampleEndpoint = EndpointDefinition<{ id: string }, { name: string }>;
