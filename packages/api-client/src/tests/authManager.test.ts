import { describe, it, expect, beforeEach } from "bun:test";
import { AuthManager } from "../auth/authManager";
import { BrowserTokenStorage } from "../auth/tokenStorage";

// Mock localStorage for BrowserTokenStorage
globalThis.localStorage = {
	store: {} as Record<string, string>,
	getItem(key: string) {
		return this.store[key] || null;
	},
	setItem(key: string, value: string) {
		this.store[key] = value;
	},
	removeItem(key: string) {
		delete this.store[key];
	},
	clear() {
		this.store = {};
	},
} as any;

describe("AuthManager", () => {
	let storage: BrowserTokenStorage;
	let manager: AuthManager;
	beforeEach(() => {
		storage = new BrowserTokenStorage();
		storage.clearToken();
		manager = new AuthManager({
			tokenStorage: storage,
			loginUrl: "/login",
			refreshUrl: "/refresh",
		});
	});

	it("should store and retrieve tokens", () => {
		storage.setToken("abc");
		expect(storage.getToken()).toBe("abc");
		storage.setRefreshToken("def");
		expect(storage.getRefreshToken()).toBe("def");
		storage.clearToken();
		expect(storage.getToken()).toBe(null);
		expect(storage.getRefreshToken()).toBe(null);
	});

	it("should return auth header if token exists", () => {
		storage.setToken("abc");
		expect(manager.getAuthHeader()).toEqual({ Authorization: "Bearer abc" });
		storage.clearToken();
		expect(manager.getAuthHeader()).toBe(null);
	});

	it("should call onAuthError on logout", () => {
		let called = false;
		manager = new AuthManager({
			tokenStorage: storage,
			loginUrl: "/login",
			refreshUrl: "/refresh",
			onAuthError: () => {
				called = true;
			},
		});
		storage.setToken("abc");
		manager.logout();
		expect(storage.getToken()).toBe(null);
		expect(called).toBe(true);
	});

	it("should return false for refreshToken stub", async () => {
		expect(await manager.refreshToken()).toBe(false);
	});
});
