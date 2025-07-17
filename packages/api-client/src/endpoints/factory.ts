/**
 * Endpoint Factory
 *
 * Factory function for creating endpoints with type hints and autocomplete support.
 */

import type { EndpointDefinition, CacheConfig } from "./index";

export function createEndpoint<TRequest, TResponse>(
	def: EndpointDefinition<TRequest, TResponse>
): EndpointDefinition<TRequest, TResponse> {
	return def;
}
