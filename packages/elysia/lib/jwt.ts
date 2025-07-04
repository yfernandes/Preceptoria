import { Elysia, ValidationError, getSchemaValidator } from "elysia";

import {
	SignJWT,
	jwtVerify,
	type JWTPayload,
	type JWSHeaderParameters,
	importPKCS8,
	importSPKI,
	errors as joseErrors,
} from "jose";

import { Type as t } from "@sinclair/typebox";
import type { Static, TSchema } from "@sinclair/typebox";

type UnwrapSchema<
	Schema extends TSchema | undefined,
	Fallback = unknown,
> = Schema extends TSchema ? Static<NonNullable<Schema>> : Fallback;

export interface JWTPayloadSpec {
	iss?: string;
	sub?: string;
	aud?: string | string[];
	jti?: string;
	nbf?: number | string;
	exp?: number | string;
	iat?: number;
}

export interface JWTOption<
	Name extends string | undefined = "jwt",
	Schema extends TSchema | undefined = undefined,
> extends JWSHeaderParameters,
		Omit<JWTPayload, "nbf" | "exp"> {
	/**
	 * Name to decorate method as
	 *
	 * ---
	 * @example
	 * For example, `jwt` will decorate Context with `Context.jwt`
	 *
	 * ```typescript
	 * app
	 *     .decorate({
	 *         name: 'myJWTNamespace',
	 *         secret: process.env.JWT_SECRETS
	 *     })
	 *     .get('/sign/:name', ({ myJWTNamespace, params }) => {
	 *         return myJWTNamespace.sign(params)
	 *     })
	 * ```
	 */
	name?: Name;
	/**
	 * JWT Secret (string, Uint8Array, or PEM key)
	 */
	secret: string | Uint8Array;
	/**
	 * Type strict validation for JWT payload
	 */
	schema?: Schema;

	/**
	 * JWT Not Before
	 *
	 * @see [RFC7519#section-4.1.5](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5)
	 */
	nbf?: string | number;
	/**
	 * JWT Expiration Time
	 *
	 * @see [RFC7519#section-4.1.4](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4)
	 */
	exp?: string | number;
}

// Supported algorithms for HMAC
const HMAC_ALGORITHMS = ["HS256", "HS384", "HS512"] as const;
type HMACAlgorithm = (typeof HMAC_ALGORITHMS)[number];

// Supported algorithms for RSA/EC
const ASYMMETRIC_ALGORITHMS = [
	"RS256",
	"RS384",
	"RS512",
	"PS256",
	"PS384",
	"PS512",
	"ES256",
	"ES384",
	"ES512",
	"EdDSA",
] as const;
type AsymmetricAlgorithm = (typeof ASYMMETRIC_ALGORITHMS)[number];

type SupportedAlgorithm = HMACAlgorithm | AsymmetricAlgorithm;

/**
 * Validates if the algorithm is supported for the given secret type
 */
function validateAlgorithm(
	alg: string,
	secret: string | Uint8Array
): alg is SupportedAlgorithm {
	if (HMAC_ALGORITHMS.includes(alg as HMACAlgorithm)) {
		return true; // HMAC algorithms work with any secret
	}

	if (ASYMMETRIC_ALGORITHMS.includes(alg as AsymmetricAlgorithm)) {
		return (
			typeof secret === "string" &&
			(secret.includes("-----BEGIN PRIVATE KEY-----") ||
				secret.includes("-----BEGIN RSA PRIVATE KEY-----") ||
				secret.includes("-----BEGIN EC PRIVATE KEY-----"))
		);
	}

	return false;
}

/**
 * Prepares the key based on the secret type and algorithm
 */
async function prepareKey(
	secret: string | Uint8Array,
	alg: string
): Promise<Uint8Array | CryptoKey> {
	if (typeof secret === "string") {
		// Check if it's a PEM key
		if (secret.includes("-----BEGIN")) {
			try {
				if (secret.includes("PRIVATE KEY")) {
					return await importPKCS8(secret, alg);
				} else if (secret.includes("PUBLIC KEY")) {
					return await importSPKI(secret, alg);
				}
			} catch (error) {
				throw new Error(
					`Invalid PEM key format: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}
		}
		// Treat as HMAC secret
		return new TextEncoder().encode(secret);
	}

	// Uint8Array - treat as HMAC secret
	return secret;
}

export const jwt = <
	const Name extends string = "jwt",
	const Schema extends TSchema | undefined = undefined,
>({
	name = "jwt" as Name,
	secret,
	// Start JWT Header
	alg = "HS256",
	crit,
	schema,
	// End JWT Header
	// Start JWT Payload
	nbf,
	exp,
	...payload
}: // End JWT Payload
JWTOption<Name, Schema>) => {
	if (!secret) {
		throw new Error("JWT secret cannot be empty");
	}

	if (!validateAlgorithm(alg, secret)) {
		throw new Error(
			`Algorithm '${alg}' is not supported for the provided secret type`
		);
	}

	const validator = schema
		? getSchemaValidator(
				t.Intersect([
					schema,
					t.Object({
						iss: t.Optional(t.String()),
						sub: t.Optional(t.String()),
						aud: t.Optional(t.Union([t.String(), t.Array(t.String())])),
						jti: t.Optional(t.String()),
						nbf: t.Optional(t.Union([t.String(), t.Number()])),
						exp: t.Optional(t.Union([t.String(), t.Number()])),
						iat: t.Optional(t.Number()),
					}),
				]),
				{}
			)
		: undefined;

	return new Elysia({
		name: "@elysiajs/jwt",
		seed: {
			name,
			secret,
			alg,
			crit,
			schema,
			nbf,
			exp,
			...payload,
		},
	}).decorate(name as Name extends string ? Name : "jwt", {
		async sign(
			morePayload: UnwrapSchema<Schema, Record<string, string | number>> &
				JWTPayloadSpec
		): Promise<string> {
			try {
				const key = await prepareKey(secret, alg);

				let jwt = new SignJWT({
					...payload,
					...morePayload,
					exp: undefined,
					nbf: undefined,
				}).setProtectedHeader({
					alg,
					...(crit && { crit }),
				});

				// Set default expiration if not provided
				if (nbf) jwt = jwt.setNotBefore(nbf);
				if (exp) jwt = jwt.setExpirationTime(exp);
				jwt.setIssuedAt();

				// Override with payload-specific values
				if (morePayload.exp) jwt = jwt.setExpirationTime(morePayload.exp);
				if (morePayload.nbf) jwt = jwt.setNotBefore(morePayload.nbf);

				return await jwt.sign(key);
			} catch (error) {
				throw new Error(
					`JWT signing failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}
		},
		async verify(
			jwt?: string
		): Promise<
			| (UnwrapSchema<Schema, Record<string, string | number>> & JWTPayloadSpec)
			| false
		> {
			if (!jwt) return false;

			try {
				const key = await prepareKey(secret, alg);
				const { payload: data } = await jwtVerify(jwt, key, {
					algorithms: [alg],
				});

				if (validator && !validator.Check(data)) {
					throw new ValidationError("JWT", validator, data);
				}

				return data as UnwrapSchema<Schema, Record<string, string | number>> &
					JWTPayloadSpec;
			} catch (error) {
				// Handle specific JWT errors
				if (error instanceof joseErrors.JWTExpired) {
					console.error("JWT expired:", error.message);
				} else if (error instanceof joseErrors.JWSSignatureVerificationFailed) {
					console.error("JWT signature verification failed:", error.message);
				} else {
					console.error(
						"JWT verification error:",
						error instanceof Error ? error.message : "Unknown error"
					);
				}
				return false;
			}
		},
	});
};

export default jwt;
