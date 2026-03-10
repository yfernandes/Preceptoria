import { Elysia } from "elysia";
import { SignJWT, jwtVerify } from "jose";
import { Type as t } from "@sinclair/typebox";
import { UserRoles } from "@api/modules/common/role.abstract";

// JWT Payload Schema for our application
export const jwtPayloadSchema = t.Object({
	id: t.String(),
	roles: t.Array(t.Enum(UserRoles)), // Use UserRoles enum directly
	iat: t.Optional(t.Number()),
	exp: t.Optional(t.Number()),
	// Optional hardening claims
	aud: t.Optional(t.String()),
	iss: t.Optional(t.String()),
	sub: t.Optional(t.String()),
});

export interface CustomJwtPayload {
	id: string;
	roles: UserRoles[];
	iat?: number;
	exp?: number;
	aud?: string;
	iss?: string;
	sub?: string;
}

// Supported algorithms - explicit allowlist for security
const ALLOWED_ALGORITHMS = ["HS256", "HS384", "HS512"] as const;
type AllowedAlgorithm = (typeof ALLOWED_ALGORITHMS)[number];

// JWT Configuration interface
export interface JwtConfig {
	secret: string | Uint8Array;
	alg?: AllowedAlgorithm;
	accessTokenExpiry?: string;
	refreshTokenExpiry?: string;
	// Optional hardening
	issuer?: string;
	audience?: string;
	clockTolerance?: string;
}

// Default configuration
const defaultConfig: Required<
	Omit<JwtConfig, "issuer" | "audience" | "clockTolerance">
> & {
	issuer?: string;
	audience?: string;
	clockTolerance: string;
} = {
	secret: "",
	alg: "HS256",
	accessTokenExpiry: "15m",
	refreshTokenExpiry: "7d",
	clockTolerance: "2s",
};

/**
 * Encodes secret to Uint8Array for consistent handling
 */
export const encodeSecret = (input: string | Uint8Array): Uint8Array => {
	return typeof input === "string" ? new TextEncoder().encode(input) : input;
};

/**
 * Creates a JWT helper for direct usage (testing, controllers, etc.)
 */
export const createJwtHelper = (config: JwtConfig) => {
	const finalConfig = { ...defaultConfig, ...config };

	if (!finalConfig.secret) {
		throw new Error("JWT secret is required");
	}

	// Validate algorithm against allowlist
	if (!ALLOWED_ALGORITHMS.includes(finalConfig.alg)) {
		throw new Error(
			`Unsupported algorithm: ${finalConfig.alg}. Allowed: ${ALLOWED_ALGORITHMS.join(", ")}`
		);
	}

	// Convert secret to Uint8Array
	const secret = encodeSecret(finalConfig.secret);

	return {
		/**
		 * Sign a JWT token with the given payload
		 */
		async sign(
			payload: Omit<CustomJwtPayload, "iat" | "exp">,
			options?: {
				type?: "access" | "refresh";
				expiry?: string;
			}
		): Promise<string> {
			try {
				const tokenType = options?.type ?? "access";
				const expiry =
					options?.expiry ??
					(tokenType === "access"
						? finalConfig.accessTokenExpiry
						: finalConfig.refreshTokenExpiry);

				let jwt = new SignJWT(payload)
					.setProtectedHeader({ alg: finalConfig.alg })
					.setIssuedAt()
					.setExpirationTime(expiry);

				// Add standard JWT claims if configured
				if (finalConfig.issuer) {
					jwt = jwt.setIssuer(finalConfig.issuer);
				}
				if (finalConfig.audience) {
					jwt = jwt.setAudience(finalConfig.audience);
				}
				// Always set subject to user ID for consistency
				jwt = jwt.setSubject(payload.id);

				return await jwt.sign(secret);
			} catch (error) {
				throw new Error(
					`JWT signing failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}
		},

		/**
		 * Verify a JWT token and return the payload
		 */
		async verify(token: string): Promise<CustomJwtPayload | false> {
			if (!token) return false;

			try {
				const { payload } = await jwtVerify(token, secret, {
					algorithms: [finalConfig.alg],
					clockTolerance: finalConfig.clockTolerance,
					// Validate standard claims if configured
					...(finalConfig.issuer && { issuer: finalConfig.issuer }),
					...(finalConfig.audience && { audience: finalConfig.audience }),
				});

				// Validate payload structure
				if (!payload.id || !payload.roles || !Array.isArray(payload.roles)) {
					return false;
				}

				// Validate roles are all valid UserRoles
				if (
					!payload.roles.every((r: unknown) =>
						Object.values(UserRoles).includes(r as UserRoles)
					)
				) {
					return false;
				}

				return payload as unknown as CustomJwtPayload;
			} catch (error) {
				// Only log in non-production environments to avoid information leakage
				if (error instanceof Error && process.env.NODE_ENV !== "production") {
					console.debug("JWT verification failed:", error.message);
				}
				return false;
			}
		},

		/**
		 * Generate both access and refresh tokens for a user
		 */
		async generateTokenPair(user: { id: string; roles: UserRoles[] }): Promise<{
			accessToken: string;
			refreshToken: string;
		}> {
			const payload = {
				id: user.id,
				roles: user.roles, // Use UserRoles[] directly
			};

			const [accessToken, refreshToken] = await Promise.all([
				this.sign(payload, { type: "access" }),
				this.sign(payload, { type: "refresh" }),
			]);

			return { accessToken, refreshToken };
		},
	};
};

/**
 * Creates a JWT plugin for Elysia with support for access and refresh tokens
 */
export const createJwtPlugin = (config: JwtConfig) => {
	const helper = createJwtHelper(config);

	return new Elysia({
		name: "jwt-plugin",
		seed: config,
	}).decorate("jwt", helper);
};

// Export a default function for backward compatibility
export const jwt = createJwtPlugin;

export default jwt;
