"use client";

import React, { createContext, useContext, useState } from "react";
import { treatise } from "../lib/eden";
import { User } from "types";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	signin: (email: string, password: string) => Promise<void>;
	signout: () => Promise<void>;
	clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const signin = async (email: string, password: string) => {
		try {
			setLoading(true);
			setError(null);

			const response = await treatise.auth.signin.post({ email, password });

			if (response.data?.success && response.data.user) {
				// Session cookie is automatically set by the server
				setUser(response.data.user);
				console.log("Login successful, user set:", response.data.user);
			} else {
				throw new Error(response.data?.message || "Login failed");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Login failed";
			setError(errorMessage);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const signout = async () => {
		try {
			await treatise.auth.logout.post();
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
