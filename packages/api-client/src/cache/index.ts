/**
 * Caching Layer
 *
 * Handles response caching and request deduplication.
 */

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

export * from "./requestDeduplicator";
export * from "./invalidation";

export class CacheManager {
	private cache: Map<string, CacheEntry<any>> = new Map();

	constructor(private defaultTTL: number = 300000) {} // default 5 minutes

	get<T>(key: string): CacheEntry<T> | null {
		const entry = this.cache.get(key);
		if (!entry) return null;
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}
		return entry as CacheEntry<T>;
	}

	set<T>(key: string, data: T, ttl?: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttl ?? this.defaultTTL,
		});
	}

	invalidate(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}
