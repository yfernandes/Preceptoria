/**
 * Error Handling
 *
 * Standardized error objects and error handling utilities.
 */

import { ValidationErrors } from "./validationError";

export interface ApiError {
	message: string;
	status?: number;
	code?: string;
	validationErrors?: ValidationErrors;
	isNetworkError?: boolean;
}

export * from "./classifyError";
export * from "./networkError";
export * from "./validationError";
