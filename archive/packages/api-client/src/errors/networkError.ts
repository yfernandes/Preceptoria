/**
 * isNetworkError
 *
 * Utility to detect network errors.
 */

import type { ApiError } from "./index"

export function isNetworkError(error: unknown): boolean {
	return (
		(error instanceof TypeError && error.message === "Failed to fetch") ||
		(!!error &&
			typeof error === "object" &&
			"isNetworkError" in error &&
			(error as ApiError).isNetworkError === true)
	)
}
