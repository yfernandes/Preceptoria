import { describe, it, expect, beforeEach } from "bun:test";
import { CacheManager } from "../cache/index";
import { RequestDeduplicator } from "../cache/requestDeduplicator";

describe("CacheManager", () => {
	let cache: CacheManager;
	beforeEach(() => {
		cache = new CacheManager(50); // short TTL for test
	});

	it("should set and get cache entries", () => {
		cache.set("foo", 123);
		const entry = cache.get("foo");
		expect(entry?.data).toBe(123);
	});

	it("should expire entries after TTL", async () => {
		cache.set("bar", 456, 10);
		await new Promise((r) => setTimeout(r, 20));
		expect(cache.get("bar")).toBe(null);
	});

	it("should invalidate and clear cache", () => {
		cache.set("baz", 789);
		cache.invalidate("baz");
		expect(cache.get("baz")).toBe(null);
		cache.set("a", 1);
		cache.set("b", 2);
		cache.clear();
		expect(cache.get("a")).toBe(null);
		expect(cache.get("b")).toBe(null);
	});
});

describe("RequestDeduplicator", () => {
	it("should deduplicate in-flight requests", async () => {
		const dedup = new RequestDeduplicator();
		let count = 0;
		const fn = async () => {
			count++;
			return 42;
		};
		const p1 = dedup.deduplicate("k", fn);
		const p2 = dedup.deduplicate("k", fn);
		expect(p1).toBe(p2);
		expect(await p1).toBe(42);
		expect(count).toBe(1);
	});

	it("should remove request after completion", async () => {
		const dedup = new RequestDeduplicator();
		const fn = async () => 99;
		await dedup.deduplicate("x", fn);
		// Should not be in inFlight anymore
		expect((dedup as any).inFlight.has("x")).toBe(false);
	});
});
