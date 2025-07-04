import { describe, it, expect } from "bun:test";

describe("Example Test Suite", () => {
	it("should pass a basic test", () => {
		expect(1 + 1).toBe(2);
	});

	it("should handle async operations", async () => {
		const result = await Promise.resolve("test");
		expect(result).toBe("test");
	});

	it("should work with TypeScript", () => {
		const message = "Hello, TypeScript!";
		expect(message).toContain("TypeScript");
	});
});

// Example of testing environment variables
describe("Environment Configuration", () => {
	it("should have required environment variables", () => {
		expect(process.env.NODE_ENV).toBeDefined();
		// Add more environment checks as needed
	});
});
