import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { app } from "../server";

// Test server setup
let testServer: any;
const TEST_PORT = 3002; // Different port to avoid conflicts with other tests

describe("Health Check Integration Tests", () => {
	beforeAll(async () => {
		// Start test server
		testServer = app.listen(TEST_PORT);
		console.log(`🧪 Test server started on port ${TEST_PORT}`);

		// Wait for server to be ready
		await new Promise((resolve) => setTimeout(resolve, 100));
	});

	afterAll(async () => {
		// Clean up test server
		if (testServer) {
			testServer.stop();
			console.log("🧪 Test server stopped");
		}
	});

	describe("Health Check", () => {
		it("should return health status", async () => {
			const response = await fetch(`http://localhost:${TEST_PORT}/health`);

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.status).toBe("ok");
			expect(data.timestamp).toBeDefined();
			expect(data.environment).toBeDefined();
		});

		it("should return proper JSON structure", async () => {
			const response = await fetch(`http://localhost:${TEST_PORT}/health`);

			expect(response.headers.get("content-type")).toContain(
				"application/json"
			);

			const data = await response.json();

			// Check all expected fields
			expect(data).toHaveProperty("status");
			expect(data).toHaveProperty("timestamp");
			expect(data).toHaveProperty("uptime");
			expect(data).toHaveProperty("environment");

			// Check data types
			expect(typeof data.status).toBe("string");
			expect(typeof data.timestamp).toBe("string");
			expect(typeof data.uptime).toBe("number");
			expect(typeof data.environment).toBe("string");
		});

		it("should handle multiple concurrent requests", async () => {
			// Make multiple concurrent requests
			const promises = Array.from({ length: 5 }, () =>
				fetch(`http://localhost:${TEST_PORT}/health`)
			);

			const responses = await Promise.all(promises);

			// All should succeed
			responses.forEach((response) => {
				expect(response.status).toBe(200);
			});

			// All should return valid JSON
			const dataPromises = responses.map((response) => response.json());
			const dataArray = await Promise.all(dataPromises);

			dataArray.forEach((data) => {
				expect(data.status).toBe("ok");
			});
		});
	});
});
