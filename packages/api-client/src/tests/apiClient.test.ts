import { describe, it, expect, beforeEach, afterAll } from "bun:test";
import { ApiClient } from "../core/client";
import { ApiClientConfig } from "../core/config";

describe("ApiClient", () => {
	let client: ApiClient;
	const config: ApiClientConfig = {
		baseUrl: "http://localhost/api",
		defaultHeaders: { "X-Test": "1" },
		timeout: 1000,
	};
	let fetchMock: any;
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		client = new ApiClient(config);
		fetchMock = undefined;
		globalThis.fetch = ((...args: any[]) =>
			fetchMock && fetchMock(...args)) as typeof fetch;
	});

	it("should make a GET request", async () => {
		fetchMock = async () => ({
			json: async () => ({ ok: true }),
			status: 200,
			headers: { forEach: (cb: any) => cb("application/json", "content-type") },
		});
		const res = await client.get<{ ok: boolean }>("/test");
		expect(res.data.ok).toBe(true);
	});

	it("should send POST body as JSON", async () => {
		fetchMock = async () => ({
			json: async () => ({ id: 1 }),
			status: 201,
			headers: { forEach: (cb: any) => cb("application/json", "content-type") },
		});
		const res = await client.post<{ id: number }>("/items", { name: "foo" });
		expect(res.data.id).toBe(1);
	});

	it("should merge default and custom headers", async () => {
		fetchMock = async () => ({
			json: async () => ({}),
			status: 200,
			headers: { forEach: (cb: any) => cb("application/json", "content-type") },
		});
		await client.get("/test", { headers: { "X-Custom": "2" } });
	});

	it("should handle timeouts", async () => {
		fetchMock = () => new Promise(() => {});
		await expect(client.get("/timeout", { timeout: 10 })).rejects.toThrow();
	});

	// Restore original fetch after all tests
	afterAll(() => {
		globalThis.fetch = originalFetch;
	});
});
