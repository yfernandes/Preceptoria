/**
 * RequestDeduplicator
 *
 * Tracks in-flight requests and deduplicates identical requests.
 */

export class RequestDeduplicator {
	private inFlight: Map<string, Promise<any>> = new Map();

	deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
		if (this.inFlight.has(key)) {
			return this.inFlight.get(key) as Promise<T>;
		}
		const promise = requestFn().finally(() => {
			this.inFlight.delete(key);
		});
		this.inFlight.set(key, promise);
		return promise;
	}

	cancelRequest(key: string): void {
		// Placeholder: implement cancellation if needed (e.g., with AbortController)
		this.inFlight.delete(key);
	}
}
