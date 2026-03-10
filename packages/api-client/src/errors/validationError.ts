/**
 * Validation Error Utilities
 *
 * Interfaces and utilities for formatting validation errors.
 */

export interface ValidationError {
	field: string;
	message: string;
}

export type ValidationErrors = Record<string, string[]>;

/**
 * formatValidationErrors
 *
 * Converts ValidationErrors to an array of ValidationError objects for form libraries.
 */
export function formatValidationErrors(
	errors: ValidationErrors
): ValidationError[] {
	return Object.entries(errors).flatMap(([field, messages]) =>
		messages.map((message) => ({ field, message }))
	);
}
