/**
 * API Client
 *
 * Core API client implementation with HTTP methods and request handling.
 */

import type { ApiClientConfig } from "./config";

export interface RequestConfig {
	headers?: Record<string, string>;
	params?: Record<string, string | number | boolean>;
	body?: any;
	signal?: AbortSignal;
	timeout?: number;
}

export interface ApiResponse<T> {
	data: T;
	status: number;
	headers: Record<string, string>;
}

export class ApiClient {
	private config: ApiClientConfig;

	constructor(config: ApiClientConfig) {
		this.config = config;
	}

	private buildUrl(
		url: string,
		params?: Record<string, string | number | boolean>
	): string {
		if (!params) return this.config.baseUrl + url;
		const query = Object.entries(params)
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join("&");
		return `${this.config.baseUrl}${url}${query ? `?${query}` : ""}`;
	}

	private buildHeaders(extra?: Record<string, string>): Record<string, string> {
		return {
			"Content-Type": "application/json",
			...(this.config.defaultHeaders || {}),
			...(extra || {}),
		};
	}

	async request<T>(
		method: string,
		url: string,
		config: RequestConfig = {}
	): Promise<ApiResponse<T>> {
		const fullUrl = this.buildUrl(url, config.params);
		const headers = this.buildHeaders(config.headers);
		const fetchConfig: RequestInit = {
			method,
			headers,
			body: config.body ? JSON.stringify(config.body) : undefined,
			signal: config.signal,
		};
		const timeout = config.timeout ?? this.config.timeout;
		let controller: AbortController | undefined;
		let timeoutId: any;
		if (timeout) {
			controller = new AbortController();
			fetchConfig.signal = controller.signal;
			timeoutId = setTimeout(() => controller!.abort(), timeout);
		}
		try {
			const res = await fetch(fullUrl, fetchConfig);
			const data = await res.json().catch(() => null);
			const headersObj: Record<string, string> = {};
			res.headers.forEach((v, k) => (headersObj[k] = v));
			return { data, status: res.status, headers: headersObj };
		} finally {
			if (timeoutId) clearTimeout(timeoutId);
		}
	}

	get<T>(url: string, config?: RequestConfig) {
		return this.request<T>("GET", url, config);
	}
	post<T>(url: string, body?: any, config?: RequestConfig) {
		return this.request<T>("POST", url, { ...config, body });
	}
	put<T>(url: string, body?: any, config?: RequestConfig) {
		return this.request<T>("PUT", url, { ...config, body });
	}
	patch<T>(url: string, body?: any, config?: RequestConfig) {
		return this.request<T>("PATCH", url, { ...config, body });
	}
	delete<T>(url: string, config?: RequestConfig) {
		return this.request<T>("DELETE", url, config);
	}
}
