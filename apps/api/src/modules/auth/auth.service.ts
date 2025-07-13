import { User } from "@api/modules/entities";
import { UserRoles } from "@api/modules/common/role.abstract";
import { db } from "@api/db";
import { ValidationError } from "class-validator";
import { createJwtHelper } from "lib/jwt";

// JWT Configuration
const JWT_CONFIG = {
	secret: Bun.env.JWT_SECRET || "fallback-secret-for-development",
	alg: "HS256" as const,
	accessTokenExpiry: "15m",
	refreshTokenExpiry: "7d",
	clockTolerance: "2s",
	issuer: "preceptoria-api",
	audience: "preceptoria-web",
};

// Token age constants
export const ACCESS_TOKEN_AGE = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_AGE = 7 * 24 * 60 * 60; // 7 days

// Cookie configuration
export const COOKIE_CONFIG = {
	httpOnly: process.env.NODE_ENV === "production",
	secure: process.env.NODE_ENV === "production",
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
	path: "/",
} as const;

// JWT helper instance
export const jwtHelper = createJwtHelper(JWT_CONFIG);

// Types for better type safety
export interface AuthInput {
	name: string;
	email: string;
	phone: string;
	password: string;
}

export interface SignInInput {
	email: string;
	password: string;
}

export interface UserResponse {
	id: string;
	name: string;
	email: string;
	phone: string;
	roles: UserRoles[];
	createdAt: string;
	updatedAt: string;
}

export interface AuthResult {
	success: boolean;
	message: string;
	user?: UserResponse;
	accessToken?: string;
	refreshToken?: string;
}

export interface ValidationErrorResponse {
	success: false;
	message: string;
	errors: {
		field: string;
		constraints: Record<string, string>;
	}[];
}

/**
 * Creates a user response object with consistent field naming
 */
export const createUserResponse = (user: User): UserResponse => ({
	id: user.id,
	name: user.name,
	email: user.email,
	phone: user.phoneNumber, // Normalized field name
	roles: user.roles,
	createdAt: user.createdAt.toISOString(),
	updatedAt: user.updatedAt.toISOString(),
});

/**
 * Handles validation errors from class-validator
 */
export const handleValidationError = (
	err: unknown
): ValidationErrorResponse | null => {
	if (
		Array.isArray(err) &&
		err.length > 0 &&
		err.every((e) => e instanceof ValidationError)
	) {
		return {
			success: false,
			message: "Validation failed",
			errors: err.map((e) => ({
				field: e.property,
				constraints: e.constraints ?? {},
			})),
		};
	}
	return null;
};

/**
 * Validates and assigns default role to new users
 */
export const assignDefaultRole = (user: User): void => {
	const validDefaultRoles: UserRoles[] = [UserRoles.Student];
	user.roles = validDefaultRoles;
};

/**
 * Core sign-up logic as a pure function
 */
export const handleSignUp = async (input: AuthInput): Promise<AuthResult> => {
	try {
		const existing = await db.user.findOne({ email: input.email });
		if (existing) {
			return {
				success: false,
				message: "User already exists",
			};
		}

		const user = await User.create(
			input.name,
			input.email,
			input.phone,
			input.password
		);

		assignDefaultRole(user);
		await db.em.persistAndFlush(user);

		const { accessToken, refreshToken } = await jwtHelper.generateTokenPair({
			id: user.id,
			roles: user.roles,
		});

		return {
			success: true,
			message: "User created successfully",
			user: createUserResponse(user),
			accessToken,
			refreshToken,
		};
	} catch (err) {
		const validationError = handleValidationError(err);
		if (validationError) return validationError;
		return {
			success: false,
			message: "Internal Server Error",
		};
	}
};

/**
 * Core sign-in logic as a pure function
 */
export const handleSignIn = async (input: SignInInput): Promise<AuthResult> => {
	try {
		const user = await db.user.findOne(
			{ email: input.email },
			{ populate: ["passwordHash"] }
		);

		if (
			!user ||
			!(await Bun.password.verify(input.password, user.passwordHash))
		) {
			return {
				success: false,
				message: "User or password incorrect",
			};
		}

		const { accessToken, refreshToken } = await jwtHelper.generateTokenPair({
			id: user.id,
			roles: user.roles,
		});

		return {
			success: true,
			message: "User logged in successfully",
			user: createUserResponse(user),
			accessToken,
			refreshToken,
		};
	} catch (err) {
		console.error("Signin error:", err);
		return {
			success: false,
			message: "Internal Server Error",
		};
	}
};

/**
 * Core token refresh logic as a pure function
 */
export const handleTokenRefresh = async (
	refreshToken: string
): Promise<AuthResult> => {
	if (!refreshToken) {
		return {
			success: false,
			message: "No refresh token provided",
		};
	}

	try {
		const payload = await jwtHelper.verify(refreshToken);

		if (!payload) {
			return {
				success: false,
				message: "Invalid or expired refresh token",
			};
		}

		const newAccessToken = await jwtHelper.sign({
			id: payload.id,
			roles: payload.roles,
		});

		const newRefreshToken = await jwtHelper.sign(
			{
				id: payload.id,
				roles: payload.roles,
			},
			{ type: "refresh" }
		);

		return {
			success: true,
			message: "Tokens refreshed successfully",
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		};
	} catch (error) {
		console.error("Refresh token error:", error);
		return {
			success: false,
			message: "Invalid or expired refresh token",
		};
	}
};

/**
 * Sets authentication cookies with proper configuration
 */
export const setAuthCookies = (
	auth: { set: (config: Record<string, unknown>) => void },
	refreshCookie: { set: (config: Record<string, unknown>) => void },
	accessToken: string,
	refreshToken: string
): void => {
	const cookieConfig = {
		httpOnly: COOKIE_CONFIG.httpOnly,
		secure: COOKIE_CONFIG.secure,
		sameSite: COOKIE_CONFIG.sameSite,
		path: COOKIE_CONFIG.path,
	};

	auth.set({
		...cookieConfig,
		maxAge: ACCESS_TOKEN_AGE,
		value: accessToken,
	});

	refreshCookie.set({
		...cookieConfig,
		maxAge: REFRESH_TOKEN_AGE,
		value: refreshToken,
	});
};
