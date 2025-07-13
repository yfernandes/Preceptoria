import { t } from "elysia";

export const jwtPayload = t.Object({
	// Should be a string since this is what jwt.sign return
	// But I want to have type safety after the token is verified
	id: t.String(),
	roles: t.String(), // Actually a stringedized array
});

export type TJwtPayload = typeof jwtPayload.static;

export const authCookie = t.Cookie({
	CookieValue: t.String(),
});

export const tCookie = {
	cookie: t.Object({
		session: t.Union([authCookie, t.String()]),
		refresh: t.Union([authCookie, t.String()]),
	}),
};

// Types for the refactored middleware
export interface AuthenticatedUser {
	id: string;
	roles: string; // JSON stringified array
}

export interface UserContext {
	id: string;
	roles: string[];
	sysAdminId?: string;
	orgAdminId?: string;
	supervisorId?: string;
	hospitalManagerId?: string;
	preceptorId?: string;
	studentId?: string;
}

// Cookie value extraction helper type
export type CookieValue = string | { CookieValue: string };
