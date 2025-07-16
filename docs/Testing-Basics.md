# Testing Basics

Fundamental testing approaches and patterns for the Preceptoria project, emphasizing pure function architecture and comprehensive JWT security testing.

## Testing Philosophy

- **Pure Functions:** All business logic extracted into pure, testable functions
- **Security First:** Comprehensive security testing for authentication and authorization
- **Type Safety:** Leverage TypeScript for compile-time testing
- **Real-world Scenarios:** Test actual use cases, not just happy paths

## Pure Function Testing

### Why Pure Functions?

Pure functions make testing straightforward because they:

- Have no side effects
- Always return the same output for the same input
- Don't depend on external state
- Are easy to mock and test in isolation

### Example: Testing Auth Functions

```typescript
// Pure function - easy to test
export const handleSignUp = async (input: AuthInput): Promise<AuthResult> => {
	// Business logic here
	return result;
};

// Test the function directly
describe("handleSignUp", () => {
	test("should create user with default role", async () => {
		const input = {
			name: "Test User",
			email: "test@example.com",
			phone: "+1234567890",
			password: "password123",
		};

		const result = await handleSignUp(input);

		expect(result.success).toBe(true);
		expect(result.user?.roles).toEqual([UserRoles.Student]);
	});

	test("should fail for existing email", async () => {
		// Mock database to return existing user
		jest.spyOn(db.user, "findOne").mockResolvedValue(mockUser);

		const result = await handleSignUp(input);

		expect(result.success).toBe(false);
		expect(result.message).toBe("User already exists");
	});
});
```

## JWT Security Testing

### Core JWT Testing Areas

Our JWT implementation includes comprehensive security testing:

#### 1. Algorithm Validation

```typescript
describe("JWT Algorithm Security", () => {
	test("should reject unsupported algorithms", () => {
		expect(() =>
			createJwtHelper({
				secret: "test",
				alg: "none" as any,
			})
		).toThrow("Unsupported algorithm");
	});

	test("should accept only secure algorithms", () => {
		const secureAlgorithms = ["HS256", "HS384", "HS512"];

		secureAlgorithms.forEach((alg) => {
			expect(() =>
				createJwtHelper({
					secret: "test",
					alg: alg as any,
				})
			).not.toThrow();
		});
	});
});
```

#### 2. Token Verification

```typescript
describe("JWT Token Verification", () => {
	test("should verify valid tokens", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });
		const payload = { id: "user-1", roles: [UserRoles.Student] };

		const token = await jwt.sign(payload);
		const verified = await jwt.verify(token);

		expect(verified).toBeTruthy();
		expect(verified?.id).toBe("user-1");
	});

	test("should reject tampered tokens", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });
		const token =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMSIsInJvbGVzIjpbIlN0dWRlbnQiXX0.tampered-signature";

		const verified = await jwt.verify(token);
		expect(verified).toBe(false);
	});

	test("should reject expired tokens", async () => {
		const jwt = createJwtHelper({
			secret: "test-secret",
			accessTokenExpiry: "1ms", // Very short expiry
		});

		const token = await jwt.sign({ id: "user-1", roles: [UserRoles.Student] });

		// Wait for token to expire
		await new Promise((resolve) => setTimeout(resolve, 10));

		const verified = await jwt.verify(token);
		expect(verified).toBe(false);
	});
});
```

#### 3. Role Validation

```typescript
describe("JWT Role Validation", () => {
	test("should accept valid roles", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });
		const payload = {
			id: "user-1",
			roles: [UserRoles.Student, UserRoles.Supervisor],
		};

		const token = await jwt.sign(payload);
		const verified = await jwt.verify(token);

		expect(verified?.roles).toEqual([UserRoles.Student, UserRoles.Supervisor]);
	});

	test("should reject invalid roles", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });
		const payload = {
			id: "user-1",
			roles: ["InvalidRole" as any],
		};

		const token = await jwt.sign(payload);
		const verified = await jwt.verify(token);

		expect(verified).toBe(false);
	});
});
```

#### 4. Clock Tolerance Testing

```typescript
describe("JWT Clock Tolerance", () => {
	test("should handle clock skew within tolerance", async () => {
		const jwt = createJwtHelper({
			secret: "test-secret",
			clockTolerance: "5s",
		});

		// Mock time to be 3 seconds in the future
		const originalDate = Date;
		global.Date = class extends Date {
			constructor() {
				super();
				return new originalDate(Date.now() + 3000);
			}
		} as any;

		const token = await jwt.sign({ id: "user-1", roles: [UserRoles.Student] });
		const verified = await jwt.verify(token);

		expect(verified).toBeTruthy();

		// Restore original Date
		global.Date = originalDate;
	});
});
```

## Integration Testing

### End-to-End Authentication Flows

```typescript
describe("Authentication Integration", () => {
	test("complete signup and signin flow", async () => {
		// 1. Sign up
		const signupResult = await handleSignUp({
			name: "Test User",
			email: "test@example.com",
			phone: "+1234567890",
			password: "password123",
		});

		expect(signupResult.success).toBe(true);
		expect(signupResult.accessToken).toBeDefined();
		expect(signupResult.refreshToken).toBeDefined();

		// 2. Sign in
		const signinResult = await handleSignIn({
			email: "test@example.com",
			password: "password123",
		});

		expect(signinResult.success).toBe(true);
		expect(signinResult.accessToken).toBeDefined();
		expect(signinResult.refreshToken).toBeDefined();
	});

	test("token refresh flow", async () => {
		// 1. Get initial tokens
		const signupResult = await handleSignUp({
			name: "Test User",
			email: "test@example.com",
			phone: "+1234567890",
			password: "password123",
		});

		// 2. Refresh tokens
		const refreshResult = await handleTokenRefresh(signupResult.refreshToken!);

		expect(refreshResult.success).toBe(true);
		expect(refreshResult.accessToken).toBeDefined();
		expect(refreshResult.refreshToken).toBeDefined();

		// 3. Verify old refresh token is invalid
		const oldTokenResult = await handleTokenRefresh(signupResult.refreshToken!);
		expect(oldTokenResult.success).toBe(false);
	});
});
```

## Performance Testing

### Load Testing Authentication

```typescript
describe("Authentication Performance", () => {
	test("should handle concurrent signups", async () => {
		const concurrentUsers = 10;
		const signupPromises = Array.from({ length: concurrentUsers }, (_, i) =>
			handleSignUp({
				name: `User ${i}`,
				email: `user${i}@example.com`,
				phone: `+123456789${i}`,
				password: "password123",
			})
		);

		const results = await Promise.all(signupPromises);
		const successful = results.filter((r) => r.success);

		expect(successful.length).toBe(concurrentUsers);
	});

	test("should handle concurrent token refreshes", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });
		const payload = { id: "user-1", roles: [UserRoles.Student] };
		const token = await jwt.sign(payload, { type: "refresh" });

		const concurrentRefreshes = 5;
		const refreshPromises = Array.from({ length: concurrentRefreshes }, () =>
			handleTokenRefresh(token)
		);

		const results = await Promise.all(refreshPromises);
		const successful = results.filter((r) => r.success);

		// Only one should succeed due to token rotation
		expect(successful.length).toBe(1);
	});
});
```

## Error Handling Testing

### Validation Error Testing

```typescript
describe("Validation Error Handling", () => {
	test("should handle validation errors gracefully", async () => {
		// Mock validation error
		const validationError = new ValidationError();
		validationError.property = "email";
		validationError.constraints = { isEmail: "Invalid email format" };

		jest.spyOn(User, "create").mockRejectedValue([validationError]);

		const result = await handleSignUp({
			name: "Test User",
			email: "invalid-email",
			phone: "+1234567890",
			password: "password123",
		});

		expect(result.success).toBe(false);
		expect(result.message).toBe("Validation failed");
		expect(result.errors).toHaveLength(1);
		expect(result.errors![0].field).toBe("email");
	});
});
```

## Security Testing Best Practices

### 1. Test All Failure Modes

```typescript
describe("Security Failure Modes", () => {
	test("should handle malformed tokens", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });

		const malformedTokens = [
			"",
			"not-a-jwt",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", // Missing payload
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMSJ9", // Missing signature
		];

		for (const token of malformedTokens) {
			const result = await jwt.verify(token);
			expect(result).toBe(false);
		}
	});
});
```

### 2. Test Token Rotation Security

```typescript
describe("Token Rotation Security", () => {
	test("should prevent refresh token reuse", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });
		const payload = { id: "user-1", roles: [UserRoles.Student] };
		const refreshToken = await jwt.sign(payload, { type: "refresh" });

		// First refresh should succeed
		const result1 = await handleTokenRefresh(refreshToken);
		expect(result1.success).toBe(true);

		// Second refresh with same token should fail
		const result2 = await handleTokenRefresh(refreshToken);
		expect(result2.success).toBe(false);
	});
});
```

## Test Organization

### File Structure

```
tests/
├── unit/
│   ├── auth.functions.test.ts    # Pure function tests
│   ├── jwt.security.test.ts      # JWT security tests
│   └── validation.test.ts        # Validation tests
├── integration/
│   ├── auth.flow.test.ts         # End-to-end flows
│   └── database.test.ts          # Database integration
└── performance/
    ├── load.test.ts              # Load testing
    └── stress.test.ts            # Stress testing
```

### Test Naming Conventions

- **Unit tests**: `describe('functionName', () => {})`
- **Integration tests**: `describe('feature integration', () => {})`
- **Security tests**: `describe('security: attack vector', () => {})`
- **Performance tests**: `describe('performance: scenario', () => {})`

## Running Tests

### Development

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/unit/auth.functions.test.ts

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch
```

### CI/CD

```bash
# Run tests in CI environment
bun test --ci --coverage --reporter=verbose

# Run security tests only
bun test tests/unit/jwt.security.test.ts

# Run performance tests
bun test tests/performance/
```

## Continuous Testing

### Pre-commit Hooks

```json
{
	"husky": {
		"hooks": {
			"pre-commit": "bun test --staged",
			"pre-push": "bun test --coverage"
		}
	}
}
```

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test --coverage
      - run: bun test tests/unit/jwt.security.test.ts
```

## Coverage Goals

- **Unit Tests**: 90%+ coverage for all pure functions
- **Integration Tests**: 100% coverage for critical flows
- **Security Tests**: 100% coverage for all security scenarios
- **Performance Tests**: Baseline metrics for all endpoints

---

This testing approach ensures our authentication system is robust, secure, and maintainable. The pure function architecture makes testing straightforward, while comprehensive security testing protects against common attack vectors.
