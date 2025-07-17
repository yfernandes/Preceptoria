import { useCallback, useEffect, useRef, useState } from "react";
import type { EndpointDefinition } from "../endpoints";
import type { RequestState } from "../types";
import { createRequestState, setLoading, setSuccess, setError } from "../types";
import type { ApiError } from "../errors";
import { classifyError } from "../errors";
import { ApiClient } from "../core";

interface UseApiRequestOptions {
	skip?: boolean;
	client: ApiClient;
}

export function useApiRequest<TRequest, TResponse>(
	endpoint: EndpointDefinition<TRequest, TResponse>,
	params?: TRequest,
	options?: UseApiRequestOptions
) {
	const [state, setState] =
		useState<RequestState<TResponse>>(createRequestState<TResponse>());
	const abortRef = useRef<AbortController | null>(null);

	const fetchData = useCallback(async () => {
		if (options?.skip) return;
		setState((s) => setLoading(s));
		abortRef.current?.abort();
		abortRef.current = new AbortController();
		try {
			const url =
				typeof endpoint.url === "function"
					? endpoint.url(params as TRequest)
					: endpoint.url;
			const res = await options!.client.request<TResponse>(
				endpoint.method,
				url,
				{
					body: endpoint.method !== "GET" ? params : undefined,
					params: endpoint.method === "GET" ? (params as any) : undefined,
					headers: endpoint.headers,
					signal: abortRef.current.signal,
				}
			);
			setState((s) => setSuccess(s, res.data));
		} catch (err) {
			setState((s) => setError(s, classifyError(err)));
		}
	}, [endpoint, params, options]);

	useEffect(() => {
		fetchData();
		return () => {
			// Cleanup: cancel request on component unmount
			abortRef.current?.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchData]);

	const refetch = useCallback(fetchData, [fetchData]);

	return {
		...state,
		refetch,
	};
}
