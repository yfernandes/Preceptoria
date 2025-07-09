"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { treatise } from "../lib/eden";

type User = NonNullable<
	Awaited<ReturnType<typeof treatise.auth.signin.post>>["data"]
>["user"];

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	signin: (email: string, password: string) => Promise<void>;
	signup: (userData: {
		name: string;
		email: string;
		phone: string;
		password: string;
	}) => Promise<void>;
	signout: () => Promise<void>;
	clearError: () => void;
}

// Create a default context value
const defaultAuthContext: AuthContextType = {
	user: null,
	loading: true,
	error: null,
	signin: async () => {
		throw new Error("AuthProvider not initialized");
	},
	signup: async () => {
		throw new Error("AuthProvider not initialized");
	},
	signout: async () => {
		throw new Error("AuthProvider not initialized");
	},
	clearError: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	// Ensure we're mounted before accessing localStorage
	useEffect(() => {
		setMounted(true);
	}, []);

	// Check if user is already authenticated after mount
	useEffect(() => {
		if (mounted) {
			checkAuth();
		}
	}, [mounted]);

	const checkAuth = async () => {
		try {
			// Try to get current user from server using session cookie
			const response = await treatise.auth.me.get();

			if (response.data?.success && response.data.user) {
				console.log("Session is valid, user authenticated");
				// Update localStorage with fresh user data
				localStorage.setItem("user_data", JSON.stringify(response.data.user));
				setUser(response.data.user);
			} else {
				console.log("Session invalid or expired");
				// Clear any stale data
				localStorage.removeItem("user_data");
				setUser(null);
			}
		} catch (error) {
			console.log("Error checking auth:", error);
			// Clear any stale data on error
			localStorage.removeItem("user_data");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const signin = async (email: string, password: string) => {
		try {
			setLoading(true);
			setError(null);

			const response = await treatise.auth.signin.post({ email, password });

			if (response.data?.success && response.data.user) {
				// Session cookie is automatically set by the server
				// Store user data in localStorage for UI persistence
				localStorage.setItem("user_data", JSON.stringify(response.data.user));
				setUser(response.data.user);
			} else {
				throw new Error(response.data?.message || "Login failed");
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "Login failed");
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const signup = async (userData: {
		name: string;
		email: string;
		phone: string;
		password: string;
	}) => {
		try {
			setLoading(true);
			setError(null);

			const response = await treatise.auth.signup.post(userData);

			if (response.data?.success && response.data.user) {
				// Session cookie is automatically set by the server
				// Store user data in localStorage for UI persistence
				localStorage.setItem("user_data", JSON.stringify(response.data.user));
				setUser(response.data.user);
			} else {
				throw new Error(response.data?.message || "Registration failed");
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "Registration failed");
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const signout = async () => {
		try {
			await treatise.auth.logout.post();
			// Clear local storage
			localStorage.removeItem("user_data");
			setUser(null);
		} catch (error) {
			console.error("Logout error:", error);
			// Still clear user even if logout request fails
			localStorage.removeItem("user_data");
			setUser(null);
		}
	};

	const clearError = () => {
		setError(null);
	};

	const value: AuthContextType = {
		user,
		loading,
		error,
		signin,
		signup,
		signout,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === defaultAuthContext) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
