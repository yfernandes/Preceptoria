"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Types
interface User {
	id: string;
	name: string;
	email: string;
	phone: string;
	roles: string[];
	createdAt: string;
	updatedAt: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	signin: (email: string, password: string) => Promise<void>;
	signout: () => Promise<void>;
	clearError: () => void;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create axios instance with credentials
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // Important for cookies
	timeout: 10000,
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check if user is already authenticated on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Try to access a protected endpoint to check if user is authenticated
				const response = await api.get("/classes");
				if (response.data.success) {
					// If we can access protected endpoint, user is authenticated
					// We could also add a /me endpoint to get user details
					console.log("User is already authenticated");
				}
			} catch (error) {
				// User is not authenticated, which is fine
				console.log("User not authenticated");
				// For now, redirect to login page
			}
		};

		checkAuth();
	}, []);

	const signin = async (email: string, password: string) => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.post("/auth/signin", { email, password });

			if (response.data?.success && response.data.user) {
				// Session cookie is automatically set by the server
				setUser(response.data.user);
				console.log("Login successful, user set:", response.data.user);
			} else {
				throw new Error(response.data?.message || "Login failed");
			}
		} catch (error: unknown) {
			let errorMessage = "Login failed";
			if (axios.isAxiosError(error)) {
				errorMessage =
					error.response?.data?.message || error.message || "Login failed";
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}
			setError(errorMessage);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const signout = async () => {
		try {
			await api.post("/auth/logout");
			setUser(null);
		} catch (error) {
			console.error("Logout error:", error);
			// Still clear user even if logout request fails
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
		signout,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
