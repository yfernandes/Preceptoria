/**
 * Cache Invalidation Utilities
 *
 * Functions for invalidating cache entries by key or tags.
 */

import type { CacheManager } from "./index";

export function invalidateByKey(cache: CacheManager, key: string) {
	cache.invalidate(key);
}

export function invalidateByTags(
	cache: CacheManager,
	tagMap: Map<string, string[]>,
	tags: string[]
) {
	for (const [key, entryTags] of tagMap.entries()) {
		if (entryTags.some((t) => tags.includes(t))) {
			cache.invalidate(key);
		}
	}
}

export function manualCacheClear(cache: CacheManager) {
	cache.clear();
}
