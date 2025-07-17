/**
 * AuthManager
 *
 * Handles token management, refresh, and automatic inclusion in requests.
 */

import type { TokenStorage } from "./tokenStorage";

export interface AuthConfig {
	tokenStorage: TokenStorage;
	loginUrl: string;
	refreshUrl: string;
	onAuthError?: () => void;
}

export class AuthManager {
	private config: AuthConfig;

	constructor(config: AuthConfig) {
		this.config = config;
	}

	getAuthHeader(): Record<string, string> | null {
		const token = this.config.tokenStorage.getToken();
		return token ? { Authorization: `Bearer ${token}` } : null;
	}

	async refreshToken(): Promise<boolean> {
		// Placeholder: implement actual refresh logic in a later task
		// Example: send POST to this.config.refreshUrl with refresh token
		return false;
	}

	async handleAuthError(error: any): Promise<boolean> {
		// Placeholder: implement error handling and auto-refresh logic
		if (error?.status === 401) {
			const refreshed = await this.refreshToken();
			if (!refreshed && this.config.onAuthError) {
				this.config.onAuthError();
			}
			return refreshed;
		}
		return false;
	}

	logout(): void {
		this.config.tokenStorage.clearToken();
		if (this.config.onAuthError) this.config.onAuthError();
	}
}
