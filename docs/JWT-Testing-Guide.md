# JWT Testing Guide

## Overview

This guide covers comprehensive testing strategies for our JWT authentication system, based on production-grade security requirements and best practices.

## Test Coverage Strategy

### ✅ **Excellent Coverage Areas**

Our current test suite excels in these areas:

- **Configuration Edge Cases**: Empty/undefined secrets, invalid algorithms, valid configurations
- **Signing Operations**: Basic payload, token types (access/refresh), custom expiry, standard claims
- **Verification Logic**: All expected failure modes (expired, malformed, wrong signature, invalid structure)
- **Token Pair Generation**: Access and refresh token creation and validation
- **Custom Configurations**: Expiry times, algorithms, clock tolerance
- **Error Handling**: Network errors and malformed tokens
- **Performance Testing**: Concurrency and large payloads
- **Security Validation**: Algorithm allowlists, signature verification, role validation

### ⚠️ **Recommended Enhancements**

#### 1. **Token Uniqueness Testing**

Ensure that identical payloads generate different tokens (replay protection):

```typescript
it("should generate different tokens for identical payloads", async () => {
	const jwt = createJwtHelper({ secret: "test-secret" });
	const payload = { id: "123", roles: [UserRoles.Student] };

	const token1 = await jwt.sign(payload);
	const token2 = await jwt.sign(payload);

	expect(token1).not.toBe(token2);
	expect(token1.split(".")[0]).toBe(token2.split(".")[0]); // Same header
	expect(token1.split(".")[1]).not.toBe(token2.split(".")[1]); // Different payload
});
```

#### 2. **Token Tampering Detection**

Test HMAC verification failure due to payload tampering:

```typescript
it("should reject token with tampered payload", async () => {
	const jwt = createJwtHelper({ secret: "test-secret" });
	const token = await jwt.sign({ id: "123", roles: [UserRoles.Student] });

	// Tamper the payload
	const [header, payload, sig] = token.split(".");
	const tamperedPayload = Buffer.from(
		JSON.stringify({ id: "456", roles: [UserRoles.SysAdmin] })
	).toString("base64url");

	const tamperedToken = `${header}.${tamperedPayload}.${sig}`;

	const result = await jwt.verify(tamperedToken);
	expect(result).toBe(false);
});
```

#### 3. **Claim Precision Testing**

Validate exact expiry times and claim values:

```typescript
it("should set correct expiry times", async () => {
	const jwt = createJwtHelper({ secret: "test-secret" });
	const payload = { id: "123", roles: [UserRoles.Student] };

	const token = await jwt.sign(payload, { expiry: "1h" });
	const result = await jwt.verify(token);

	expect(result).not.toBe(false);
	if (result !== false) {
		expect(result.exp).toBeDefined();
		expect(result.iat).toBeDefined();
		// Allow 5-second tolerance for test execution time
		expect(result.exp! - result.iat!).toBeGreaterThanOrEqual(3595);
		expect(result.exp! - result.iat!).toBeLessThanOrEqual(3605);
	}
});
```

#### 4. **Invalid Claim Combinations**

Test rejection of invalid issuer/audience combinations:

```typescript
it("should reject tokens with wrong audience", async () => {
	const jwtSign = createJwtHelper({
		secret: "test-secret",
		issuer: "test-issuer",
		audience: "correct-audience",
	});

	const jwtVerify = createJwtHelper({
		secret: "test-secret",
		issuer: "test-issuer",
		audience: "wrong-audience",
	});

	const token = await jwtSign.sign({ id: "123", roles: [UserRoles.Student] });
	const result = await jwtVerify.verify(token);

	expect(result).toBe(false);
});
```

#### 5. **Custom Claim Handling**

Test behavior with non-standard payload fields:

```typescript
it("should preserve custom payload fields", async () => {
	const jwt = createJwtHelper({ secret: "test-secret" });
	const payload = {
		id: "123",
		roles: [UserRoles.Student],
		customField: "test-value",
	};

	const token = await jwt.sign(payload);
	const result = await jwt.verify(token);

	expect(result).not.toBe(false);
	if (result !== false) {
		expect((result as any).customField).toBe("test-value");
	}
});
```

## Code Hygiene Improvements

### 1. **Helper Functions for Common Assertions**

Create reusable assertion helpers to reduce code duplication:

```typescript
// test-helpers.ts
export const assertValidPayload = (
	result: CustomJwtPayload | false,
	expectedId: string,
	expectedRoles: UserRoles[]
) => {
	expect(result).not.toBe(false);
	if (result !== false) {
		expect(result.id).toBe(expectedId);
		expect(result.roles).toEqual(expectedRoles);
		expect(result.iat).toBeDefined();
		expect(result.exp).toBeDefined();
	}
};

export const assertJwtStructure = (token: string) => {
	const parts = token.split(".");
	expect(parts).toHaveLength(3);
	expect(parts[0]).toMatch(/^[A-Za-z0-9_-]+$/); // Header
	expect(parts[1]).toMatch(/^[A-Za-z0-9_-]+$/); // Payload
	expect(parts[2]).toMatch(/^[A-Za-z0-9_-]+$/); // Signature
};
```

### 2. **Test Data Factories**

Create factories for consistent test data:

```typescript
// test-factories.ts
export const createTestUser = (
	overrides: Partial<{ id: string; roles: UserRoles[] }> = {}
) => ({
	id: "test-user-123",
	roles: [UserRoles.Student],
	...overrides,
});

export const createTestPayload = (
	overrides: Partial<CustomJwtPayload> = {}
) => ({
	id: "test-user-123",
	roles: [UserRoles.Student],
	...overrides,
});
```

### 3. **Consistent Test Structure**

Follow a consistent pattern for all JWT tests:

```typescript
describe("JWT Helper", () => {
	let jwt: ReturnType<typeof createJwtHelper>;

	beforeEach(() => {
		jwt = createJwtHelper({ secret: "test-secret" });
	});

	describe("sign", () => {
		it("should sign valid payload", async () => {
			// Arrange
			const payload = createTestPayload();

			// Act
			const token = await jwt.sign(payload);

			// Assert
			assertJwtStructure(token);
			const result = await jwt.verify(token);
			assertValidPayload(result, payload.id, payload.roles);
		});
	});
});
```

## Security Testing Checklist

### ✅ **Required Security Tests**

- [ ] **Algorithm Validation**: Only allowed algorithms accepted
- [ ] **Secret Validation**: Empty/invalid secrets rejected
- [ ] **Signature Verification**: Tampered tokens rejected
- [ ] **Expiry Validation**: Expired tokens rejected
- [ ] **Role Validation**: Invalid roles rejected
- [ ] **Token Structure**: Malformed tokens rejected
- [ ] **Clock Tolerance**: Configurable time skew handling
- [ ] **Claim Validation**: Standard JWT claims properly validated

### 🔒 **Advanced Security Tests**

- [ ] **Token Uniqueness**: Identical payloads generate different tokens
- [ ] **Replay Protection**: Old tokens cannot be reused
- [ ] **Claim Tampering**: Modified claims detected
- [ ] **Algorithm Downgrade**: Weak algorithms rejected
- [ ] **Token Size Limits**: Extremely large payloads handled
- [ ] **Concurrent Access**: Race conditions handled

## Performance Testing

### **Load Testing**

```typescript
it("should handle concurrent token generation", async () => {
	const jwt = createJwtHelper({ secret: "test-secret" });
	const payload = createTestPayload();

	const promises = Array.from({ length: 100 }, () => jwt.sign(payload));

	const tokens = await Promise.all(promises);

	expect(tokens).toHaveLength(100);
	expect(new Set(tokens)).toHaveLength(100); // All unique
});
```

### **Memory Testing**

```typescript
it("should handle large payloads efficiently", async () => {
	const jwt = createJwtHelper({ secret: "test-secret" });
	const largePayload = {
		id: "123",
		roles: [UserRoles.Student],
		largeData: "x".repeat(10000), // 10KB payload
	};

	const token = await jwt.sign(largePayload);
	const result = await jwt.verify(token);

	expect(result).not.toBe(false);
});
```

## Error Handling Testing

### **Graceful Degradation**

```typescript
it("should handle network-like errors gracefully", async () => {
	const jwt = createJwtHelper({ secret: "test-secret" });

	// Test with malformed tokens
	const malformedTokens = [
		"not-a-jwt",
		"header.payload", // Missing signature
		"header.payload.invalid-signature",
		"", // Empty string
	];

	for (const token of malformedTokens) {
		const result = await jwt.verify(token);
		expect(result).toBe(false);
	}
});
```

## Integration Testing

### **End-to-End Authentication Flow**

```typescript
describe("Authentication Flow", () => {
	it("should complete full auth cycle", async () => {
		const jwt = createJwtHelper({ secret: "test-secret" });
		const user = createTestUser();

		// Generate token pair
		const { accessToken, refreshToken } = await jwt.generateTokenPair(user);

		// Verify both tokens
		const accessResult = await jwt.verify(accessToken);
		const refreshResult = await jwt.verify(refreshToken);

		assertValidPayload(accessResult, user.id, user.roles);
		assertValidPayload(refreshResult, user.id, user.roles);

		// Verify tokens are different
		expect(accessToken).not.toBe(refreshToken);
	});
});
```

## Best Practices Summary

### **Test Organization**

1. **Group by Functionality**: Sign, verify, configuration, security
2. **Use Descriptive Names**: Clear test descriptions
3. **Follow AAA Pattern**: Arrange, Act, Assert
4. **Isolate Tests**: Each test should be independent
5. **Use Helpers**: Reduce code duplication

### **Security Focus**

1. **Test Failure Cases**: Ensure security measures work
2. **Validate Inputs**: Test edge cases and invalid data
3. **Check Outputs**: Verify token structure and content
4. **Performance**: Ensure tests don't introduce bottlenecks
5. **Documentation**: Keep tests as living documentation

### **Maintenance**

1. **Update Tests**: When JWT implementation changes
2. **Review Coverage**: Regular coverage analysis
3. **Refactor Helpers**: Extract common patterns
4. **Security Audits**: Regular security test reviews
5. **Performance Monitoring**: Track test execution times

---

## Next Steps

1. **Implement Missing Tests**: Add token uniqueness, tampering, and claim precision tests
2. **Create Helper Functions**: Extract common assertion patterns
3. **Add Performance Tests**: Ensure scalability under load
4. **Security Review**: Regular security test audits
5. **Documentation Updates**: Keep this guide current with implementation changes

This testing guide ensures our JWT implementation meets production-grade security and reliability standards.
