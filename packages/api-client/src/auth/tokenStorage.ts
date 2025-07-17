/**
 * Token Storage Interface and Browser Implementation
 *
 * Provides a consistent interface for storing and retrieving auth tokens.
 */

export interface TokenStorage {
	getToken(): string | null;
	setToken(token: string): void;
	clearToken(): void;
	getRefreshToken(): string | null;
	setRefreshToken(token: string): void;
}

export class BrowserTokenStorage implements TokenStorage {
	private accessKey = "api_access_token";
	private refreshKey = "api_refresh_token";

	getToken(): string | null {
		return typeof window !== "undefined"
			? localStorage.getItem(this.accessKey)
			: null;
	}
	setToken(token: string): void {
		if (typeof window !== "undefined")
			localStorage.setItem(this.accessKey, token);
	}
	clearToken(): void {
		if (typeof window !== "undefined") {
			localStorage.removeItem(this.accessKey);
			localStorage.removeItem(this.refreshKey);
		}
	}
	getRefreshToken(): string | null {
		return typeof window !== "undefined"
			? localStorage.getItem(this.refreshKey)
			: null;
	}
	setRefreshToken(token: string): void {
		if (typeof window !== "undefined")
			localStorage.setItem(this.refreshKey, token);
	}
}
