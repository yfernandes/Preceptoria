/**
 * isNetworkError
 *
 * Utility to detect network errors.
 */

import type { ApiError } from "./index";

export function isNetworkError(error: any): boolean {
	return (
		(error instanceof TypeError && error.message === "Failed to fetch") ||
		(error && (error as ApiError).isNetworkError)
	);
}
