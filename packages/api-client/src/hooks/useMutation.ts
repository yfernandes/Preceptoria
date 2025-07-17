import { useCallback, useState } from "react";
import type { EndpointDefinition } from "../endpoints";
import type { RequestState } from "../types";
import { createRequestState, setLoading, setSuccess, setError } from "../types";
import type { ApiError } from "../errors";
import { classifyError } from "../errors";
import { ApiClient } from "../core";
import type { CacheManager } from "../cache";
import { invalidateByTags } from "../cache";

interface UseMutationOptions {
	client: ApiClient;
	cache?: CacheManager;
}

export function useMutation<TRequest, TResponse>(
	endpoint: EndpointDefinition<TRequest, TResponse>,
	options: UseMutationOptions
) {
	const [state, setState] =
		useState<RequestState<TResponse>>(createRequestState<TResponse>());

	const mutate = useCallback(
		async (data: TRequest) => {
			setState((s) => setLoading(s));
			try {
				const url =
					typeof endpoint.url === "function"
						? endpoint.url(data)
						: endpoint.url;
				const res = await options.client.request<TResponse>(
					endpoint.method,
					url,
					{
						body: data,
						headers: endpoint.headers,
					}
				);
				setState((s) => setSuccess(s, res.data));
				// Invalidate cache if needed
				if (options.cache && endpoint.cacheConfig?.invalidateOn) {
					invalidateByTags(
						options.cache,
						new Map(),
						endpoint.cacheConfig.invalidateOn
					);
				}
				return res.data;
			} catch (err) {
				setState((s) => setError(s, classifyError(err)));
				throw err;
			}
		},
		[endpoint, options]
	);

	const reset = useCallback(() => {
		setState(createRequestState<TResponse>());
	}, []);

	return {
		mutate,
		...state,
		reset,
	};
}
