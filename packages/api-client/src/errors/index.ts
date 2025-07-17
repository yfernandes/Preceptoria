/**
 * Error Handling
 *
 * Standardized error objects and error handling utilities.
 */

export interface ApiError {
	message: string;
	status?: number;
	code?: string;
	validationErrors?: Record<string, string[]>;
	isNetworkError?: boolean;
}

export * from "./classifyError";
export * from "./networkError";
export * from "./validationError";
