/**
 * classifyError
 *
 * Utility to classify errors as network, API, or validation errors.
 */

import type { ApiError } from "./index";

export function classifyError(error: any): ApiError {
	if (error instanceof TypeError && error.message === "Failed to fetch") {
		return { message: "Network error", isNetworkError: true };
	}
	if (error?.status === 422 && error?.validationErrors) {
		return {
			message: "Validation error",
			status: 422,
			validationErrors: error.validationErrors,
		};
	}
	return {
		message: error?.message || "API error",
		status: error?.status,
		code: error?.code,
		validationErrors: error?.validationErrors,
		isNetworkError: false,
	};
}
