import axios, { AxiosResponse } from "axios";
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { HealthResponse } from "./testTypes";

// Test configuration
const TEST_PORT = Math.floor(Math.random() * 10000) + 3001; // Random port between 3001-13000
const API_BASE_URL = `http://localhost:${TEST_PORT.toString()}`;
const TEST_TIMEOUT = 10000; // 10 seconds

// Configure axios for testing
const testClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: TEST_TIMEOUT,
	validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

describe("Health Check", () => {
	let serverProcess: ReturnType<typeof Bun.spawn> | undefined;

	beforeAll(async () => {
		// Start test server as separate process on random port
		serverProcess = Bun.spawn(
			["bun", "run", "src/index.ts", `--port=${TEST_PORT.toString()}`],
			{
				stdio: ["inherit", "inherit", "inherit"],
				env: {
					...process.env,
					NODE_ENV: "test",
				},
			}
		);

		console.log(`🧪 Test server starting on port ${TEST_PORT.toString()}`);

		// Wait for server to be ready by polling health endpoint
		let attempts = 0;
		const maxAttempts = 30; // 30 seconds max wait

		while (attempts < maxAttempts) {
			try {
				const response = await axios.get(`${API_BASE_URL}/health`, {
					timeout: 1000,
				});
				if (response.status === 200) {
					console.log(`✅ Test server ready on port ${TEST_PORT.toString()}`);
					break;
				}
			} catch {
				// Server not ready yet, wait and retry
				await new Promise((resolve) => setTimeout(resolve, 1000));
				attempts++;
			}
		}

		if (attempts >= maxAttempts) {
			throw new Error(
				`Test server failed to start on port ${TEST_PORT.toString()}`
			);
		}
	});

	afterAll(() => {
		// Clean up test server process
		if (serverProcess) {
			serverProcess.kill();
			console.log("🧪 Test server process terminated");
		}
	});

	it("should return health status", async () => {
		try {
			const response: AxiosResponse<HealthResponse> =
				await testClient.get("/health");

			// Verify response status
			expect(response.status).toBe(200);

			// Verify response data structure
			expect(response.data).toBeDefined();
			expect(response.data.status).toBe("ok");
			expect(response.data.timestamp).toBeDefined();
			expect(response.data.uptime).toBeDefined();
			expect(response.data.environment).toBeDefined();

			// Verify data types
			expect(typeof response.data.status).toBe("string");
			expect(typeof response.data.timestamp).toBe("string");
			expect(typeof response.data.uptime).toBe("number");
			expect(typeof response.data.environment).toBe("string");

			// Verify timestamp is valid ISO string
			expect(() => new Date(response.data.timestamp)).not.toThrow();
			expect(new Date(response.data.timestamp).toISOString()).toBe(
				response.data.timestamp
			);

			// Verify uptime is positive
			expect(response.data.uptime).toBeGreaterThan(0);

			// Verify environment is one of expected values
			expect(["development", "production", "test"]).toContain(
				response.data.environment
			);

			// Verify content type
			expect(response.headers["content-type"]).toContain("application/json");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.code === "ECONNREFUSED") {
					throw new Error(
						`Server is not running at ${API_BASE_URL}. Please start the server before running integration tests.`
					);
				}
				throw new Error(
					`Health check failed: ${String(error.response?.status ?? "unknown")} - ${error.response?.statusText ?? "unknown error"}`
				);
			}
			throw error;
		}
	});

	it("should handle health check timeout gracefully", async () => {
		// Test that health check doesn't hang indefinitely
		// This test verifies that:
		// - Health check responds within reasonable time
		// - Timeout errors are handled properly
		// Why: Health checks should be fast and reliable

		const fastClient = axios.create({
			baseURL: API_BASE_URL,
			timeout: 1000, // 1 second timeout
		});

		try {
			const response = await fastClient.get("/health");
			expect(response.status).toBe(200);
		} catch (error) {
			if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
				throw new Error("Health check timed out - server may be overloaded");
			}
			throw error;
		}
	});

	it("should not require authentication for health check", async () => {
		// Test that health check works without authentication
		// This test verifies that:
		// - Health check is publicly accessible
		// - No authentication headers are required
		// Why: Health checks should be accessible to monitoring systems

		const response: AxiosResponse<HealthResponse> = await testClient.get(
			"/health",
			{
				headers: {
					// Explicitly no Authorization header
				},
			}
		);

		expect(response.status).toBe(200);
		expect(response.data.status).toBe("ok");
	});
});
