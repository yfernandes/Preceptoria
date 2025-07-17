/**
 * Response Parsing Utility
 *
 * Parses and type-casts API responses to the appropriate interface.
 */

export async function parseApiResponse<T>(response: Response): Promise<T> {
	const data = await response.json();
	return data as T;
}
