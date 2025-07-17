import { describe, it, expect } from "bun:test";
import { classifyError, isNetworkError } from "../errors";
import { formatValidationErrors } from "../errors/validationError";

describe("Error utilities", () => {
	it("should classify network errors", () => {
		const err = new TypeError("Failed to fetch");
		const apiErr = classifyError(err);
		expect(apiErr.isNetworkError).toBe(true);
		expect(isNetworkError(apiErr)).toBe(true);
	});

	it("should classify validation errors", () => {
		const err = { status: 422, validationErrors: { foo: ["bar"] } };
		const apiErr = classifyError(err);
		expect(apiErr.status).toBe(422);
		expect(apiErr.validationErrors).toEqual({ foo: ["bar"] });
	});

	it("should format validation errors for forms", () => {
		const errors = { name: ["Required"], email: ["Invalid"] };
		const formatted = formatValidationErrors(errors);
		expect(formatted).toEqual([
			{ field: "name", message: "Required" },
			{ field: "email", message: "Invalid" },
		]);
	});
});
