# Auth Module

## Overview

The Auth Module provides comprehensive authentication functionality for the Preceptoria API, including user registration, login, token management, and logout operations. Refactored to use pure functions for better testability and maintainability.

## Architecture

### Core Components
- **Pure Functions:** All business logic extracted into pure, testable functions
- **JWT Helper:** Centralized JWT operations with security hardening
- **Type Safety:** Comprehensive TypeScript interfaces for all operations
- **Token Rotation:** Refresh token rotation for enhanced security

### Key Features
- ✅ **Pure Function Architecture:** All core logic in pure functions for easy testing
- ✅ **Token Rotation:** Refresh tokens rotated on each use
- ✅ **Type Safety:** Comprehensive TypeScript interfaces
- ✅ **Security Hardening:** JWT claims, algorithm validation, clock tolerance
- ✅ **Cookie Management:** Secure cookie configuration based on environment
- ✅ **Error Handling:** Graceful validation and error responses

## Pure Functions

### `handleSignUp(input: AuthInput): Promise<AuthResult>`

Handles user registration with validation and default role assignment.

```typescript
interface AuthInput {
	name: string;
	email: string;
	phone: string;
	password: string;
}
```

### `handleSignIn(input: SignInInput): Promise<AuthResult>`

Handles user authentication with password verification.

```typescript
interface SignInInput {
	email: string;
	password: string;
}
```

### `handleTokenRefresh(refreshToken: string): Promise<AuthResult>`

Handles token refresh with rotation for enhanced security.

### `createUserResponse(user: User): UserResponse`

Creates consistent user response objects with normalized field names.

### `assignDefaultRole(user: User): void`

Assigns default roles to new users with type safety.

## JWT Configuration

```typescript
const JWT_CONFIG = {
	secret: Bun.env.JWT_SECRET || "fallback-secret-for-development",
	alg: "HS256" as const,
	accessTokenExpiry: "15m",
	refreshTokenExpiry: "7d",
	clockTolerance: "2s",
	issuer: "preceptoria-api",
	audience: "preceptoria-web",
};
```

## Security Features

### Token Management

- **Access Tokens**: 15-minute expiry
- **Refresh Tokens**: 7-day expiry with rotation
- **Token Rotation**: New refresh token issued on each refresh
- **Secure Cookies**: httpOnly, secure, sameSite flags

### JWT Hardening

- **Algorithm Validation**: Only allowed algorithms (HS256, HS384, HS512)
- **Standard Claims**: iss, aud, sub claims for additional security
- **Clock Tolerance**: 2-second tolerance for time synchronization
- **Role Validation**: Ensures all roles are valid UserRoles enum values

## API Endpoints

### POST `/auth/signup`

Creates a new user account.

**Request:**

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"phone": "+1234567890",
	"password": "securepassword"
}
```

**Response:**

```json
{
	"success": true,
	"message": "User created successfully",
	"user": {
		"id": "user-id",
		"name": "John Doe",
		"email": "john@example.com",
		"phone": "+1234567890",
		"roles": ["Student"],
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

### POST `/auth/signin`

Authenticates a user and issues tokens.

**Request:**

```json
{
	"email": "john@example.com",
	"password": "securepassword"
}
```

**Response:**

```json
{
	"success": true,
	"message": "User logged in successfully",
	"user": {
		"id": "user-id",
		"name": "John Doe",
		"email": "john@example.com",
		"phone": "+1234567890",
		"roles": ["Student"],
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

### POST `/auth/refresh`

Refreshes access token using refresh token.

**Response:**

```json
{
	"success": true,
	"message": "Tokens refreshed successfully"
}
```

### POST `/auth/logout`

Logs out user and clears cookies.

**Response:**

```json
{
	"success": true,
	"message": "Logged out successfully"
}
```

## Testing

The pure function architecture makes testing straightforward:

```typescript
// Test sign-up logic
const result = await handleSignUp({
	name: "Test User",
	email: "test@example.com",
	phone: "+1234567890",
	password: "password123",
});

expect(result.success).toBe(true);
expect(result.user?.email).toBe("test@example.com");
```

## Error Handling

The module provides consistent error responses:

```typescript
interface ValidationErrorResponse {
	success: false;
	message: string;
	errors: Array<{
		field: string;
		constraints: Record<string, string>;
	}>;
}
```

## Future Improvements

See [Auth Module Future Improvements](./Auth-Module-Future-Improvements.md) for planned enhancements including:

- JWT token revocation strategy
- Rate limiting
- MFA support
- Session management
- Audit logging

## Security Considerations

1. **Token Storage**: Tokens are stored in httpOnly cookies
2. **Token Rotation**: Refresh tokens are rotated on each use
3. **Algorithm Validation**: Only secure algorithms are allowed
4. **Clock Tolerance**: Handles time synchronization issues
5. **Role Validation**: Ensures all roles are valid enum values
6. **Environment-based Security**: Cookie security varies by environment
