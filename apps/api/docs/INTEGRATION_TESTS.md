# Integration Tests Setup

This document explains how to set up and run integration tests for the Preceptoria API.

## Overview

Integration tests verify that your API endpoints work correctly end-to-end, including:

- Database interactions
- Authentication flows
- Protected endpoint access
- HTTP request/response handling

## Bootstrap Files Created

### 1. `src/integration/auth.integration.test.ts`

A complete example showing how to:

- Start a test server
- Sign up a new user
- Sign in with credentials
- Access protected endpoints
- Clean up test data

### 2. `test-setup.ts`

Utilities and configuration for:

- Test environment setup
- Database configuration
- Test user factories
- Authentication helpers
- Server management

## Prerequisites

### 1. Test Database

You need a separate test database. Create it:

```sql
CREATE DATABASE preceptoria_test;
```

### 2. Environment Variables

Set up test environment variables in your `.env.test` file:

```env
NODE_ENV=test
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USER=postgres
TEST_DB_PASS=postgres
TEST_DB_NAME=preceptoria_test
JWT_SECRET=test-jwt-secret-key
GOOGLE_SPREADSHEET_ID=test-spreadsheet-id
```

### 3. Database Migrations

Run migrations on your test database:

```bash
# Set test environment
export NODE_ENV=test

# Run migrations
bun run db:migration:up
```

## Running Integration Tests

### Run All Tests

```bash
bun test
```

### Run Only Integration Tests

```bash
bun test src/integration/
```

### Run with Coverage

```bash
bun test --coverage
```

### Run in Watch Mode

```bash
bun test --watch
```

## Test Pattern

### 1. Server Setup

```typescript
import { TestServer } from "../test-setup";

let testServer: TestServer;

beforeAll(async () => {
	testServer = new TestServer();
	await testServer.start(app);
});

afterAll(async () => {
	await testServer.stop();
});
```

### 2. Authentication Flow

```typescript
// Sign up a user
const signupResponse = await fetch(`${testServer.getUrl()}/auth/signup`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(userData),
});

// Extract cookies for authenticated requests
const cookies = signupResponse.headers.get("set-cookie");

// Use cookies for protected endpoints
const protectedResponse = await fetch(
	`${testServer.getUrl()}/protected-endpoint`,
	{
		headers: { Cookie: cookies },
	}
);
```

### 3. Database Cleanup

```typescript
import { cleanupTestData } from "../test-setup";

beforeEach(async () => {
	await cleanupTestData(db, User, { email: testUser.email });
});
```

## Writing Your Own Integration Tests

### 1. Create a new test file

```typescript
// src/integration/your-feature.integration.test.ts
import {
	describe,
	it,
	expect,
	beforeAll,
	afterAll,
	beforeEach,
} from "bun:test";
import { TestServer, createTestUser, authenticateUser } from "../../test-setup";
import { app } from "../server";
import { db } from "../db";

describe("Your Feature Integration Tests", () => {
	let testServer: TestServer;

	beforeAll(async () => {
		testServer = new TestServer();
		await testServer.start(app);
	});

	afterAll(async () => {
		await testServer.stop();
	});

	it("should test your feature", async () => {
		// Your test logic here
	});
});
```

### 2. Test Protected Endpoints

```typescript
it("should access protected endpoint", async () => {
	// Create and authenticate user
	const userData = createTestUser();
	const { cookies } = await authenticateUser(testServer.getUrl(), userData);

	// Test protected endpoint
	const response = await fetch(
		`${testServer.getUrl()}/your-protected-endpoint`,
		{
			headers: { Cookie: cookies },
		}
	);

	expect(response.status).toBe(200);
});
```

## Common Patterns

### Testing Error Cases

```typescript
it("should handle validation errors", async () => {
	const invalidData = { email: "invalid-email" };

	const response = await fetch(`${testServer.getUrl()}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(invalidData),
	});

	expect(response.status).toBe(400);
	const data = await response.json();
	expect(data.success).toBe(false);
});
```

### Testing Database State

```typescript
it("should persist data correctly", async () => {
	// Create data via API
	const response = await fetch(`${testServer.getUrl()}/your-endpoint`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(testData),
	});

	// Verify in database
	const savedData = await db.yourEntity.findOne({ id: "some-id" });
	expect(savedData).toBeDefined();
	expect(savedData.property).toBe(testData.property);
});
```

## Troubleshooting

### Database Connection Issues

- Ensure test database exists
- Check environment variables
- Verify database credentials

### Port Conflicts

- Change `TEST_PORT` in `test-setup.ts`
- Ensure no other services are using the test port

### Authentication Issues

- Check JWT secret is set
- Verify cookie handling
- Ensure auth middleware is working

### Test Data Cleanup

- Use `beforeEach` to clean up data
- Check for unique constraints
- Verify cleanup queries work

## Next Steps

1. **Review the bootstrap code** in `src/integration/auth.integration.test.ts`
2. **Set up your test database** and environment
3. **Run the health check test** to verify setup
4. **Implement actual protected endpoints** to test
5. **Add more integration tests** for your specific features

The bootstrap provides a solid foundation - you can now build upon this pattern to test your specific API endpoints and business logic.
