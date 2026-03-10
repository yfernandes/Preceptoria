/**
 * classifyError
 *
 * Utility to classify errors as network, API, or validation errors.
 */

import type { ApiError } from "./index";

export function classifyError(error: unknown): ApiError {
	if (error instanceof TypeError && error.message === "Failed to fetch") {
		return { message: "Network error", isNetworkError: true };
	}
	if (
		error instanceof Error &&
		"status" in error &&
		"validationErrors" in error
	) {
		return {
			message: "Validation error",
			status: 422,
			validationErrors: error.validationErrors as Record<string, string[]>,
		};
	}
	return {
		message: error instanceof Error ? error.message : "API error",
		status:
			error instanceof Error && "status" in error
				? (error.status as number)
				: undefined,
		code:
			error instanceof Error && "code" in error
				? (error.code as string)
				: undefined,
		validationErrors:
			error instanceof Error && "validationErrors" in error
				? (error.validationErrors as Record<string, string[]>)
				: undefined,
		isNetworkError: false,
	};
}
