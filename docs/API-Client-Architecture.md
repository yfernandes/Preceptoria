# API Client Architecture

## Overview

The Preceptoria application uses **Eden Treaty** for end-to-end type safety between the frontend and backend. This document explains our API client architecture and the decisions behind it.

## Eden Treaty Integration

### What is Eden Treaty?

Eden Treaty is a type-safe API client for Elysia.js that provides:

- **End-to-end type safety** between frontend and backend
- **Automatic type inference** from your Elysia server
- **Compile-time error detection** for API changes
- **IntelliSense support** in your IDE

### Basic Setup

```typescript
// apps/web/lib/eden.ts
import { App } from "@api";
import { treaty } from "@elysiajs/eden";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Direct Eden Treaty client with full type safety
export const api = treaty<App>(API_BASE_URL);
```

### Usage Examples

```typescript
// Authentication
const signinResponse = await api.auth.signin.post({
	email: "user@example.com",
	password: "password",
});

// User management
const usersResponse = await api.users.get({
	query: { limit: 10, offset: 0 },
});

// Student management
const studentResponse = await api.students({ id: "123" }).get();
```

## Architectural Decisions

### 1. Direct API Coupling

**Decision**: Use Eden Treaty directly without wrapper functions.

**Why?**

- ✅ Full type safety with zero maintenance
- ✅ No redundant code or abstractions
- ✅ API changes automatically propagate
- ✅ Better IDE support and autocomplete

**Example**:

```typescript
// ✅ Good: Direct usage
const response = await api.auth.signin.post({ email, password });

// ❌ Bad: Unnecessary wrapper
const response = await authApi.signin({ email, password });
```

### 2. No Manual Type Definitions

**Decision**: Let Eden Treaty infer types from the API instead of manually defining interfaces.

**Why?**

- ✅ Single source of truth (the API)
- ✅ No type drift between frontend and backend
- ✅ Automatic updates when API changes
- ✅ Less code to maintain

**Example**:

```typescript
// ✅ Good: Inferred from API
type User = NonNullable<
	Awaited<ReturnType<typeof api.auth.signin.post>>
>["data"]["user"];

// ❌ Bad: Manual definition (can drift)
interface User {
	id: string;
	name: string;
	email: string;
	// ... manually maintained
}
```

### 3. Monorepo Type Sharing

**Decision**: Share types through monorepo path aliases.

**Configuration**:

```json
// apps/web/tsconfig.json
{
	"paths": {
		"@api": ["../api/src/index.ts"],
		"@api/*": ["../api/src/*"]
	}
}
```

**Usage**:

```typescript
import { App } from "@api";
import type { User } from "@api/entities/user.entity";
```

## Error Handling

### Basic Error Handling

```typescript
try {
	const response = await api.auth.signin.post({ email, password });

	if (response.data?.success) {
		// Handle success
		setUser(response.data.user);
	} else {
		// Handle API error
		throw new Error(response.data?.message || "Login failed");
	}
} catch (error) {
	// Handle network/other errors
	console.error("Authentication error:", error);
}
```

### Utility Functions (When Needed)

```typescript
// Only add utilities when patterns repeat 3+ times
export const withErrorHandling = <T>(promise: Promise<T>) =>
	promise.catch((error) => {
		console.error("API Error:", error);
		throw error;
	});

// Usage
const response = await withErrorHandling(
	api.auth.signin.post({ email, password })
);
```

## Authentication Context

### AuthContext Integration

```typescript
// apps/web/contexts/AuthContext.tsx
import { api } from "../lib/eden";

// Extract types from API responses
type AuthResponse = Awaited<ReturnType<typeof api.auth.signin.post>>;
type User = NonNullable<AuthResponse["data"]>["user"];

const signin = async (email: string, password: string) => {
	const response = await api.auth.signin.post({ email, password });

	if (response.data?.success && response.data.user) {
		setUser(response.data.user);
	} else {
		throw new Error(response.data?.message || "Login failed");
	}
};
```

## Best Practices

### 1. Use Direct API Calls

```typescript
// ✅ Good: Direct and type-safe
const students = await api.students.get({
	query: { classId: "123", limit: 20 },
});

// ❌ Avoid: Unnecessary abstractions
const students = await studentsApi.list({ classId: "123", limit: 20 });
```

### 2. Leverage Type Inference

```typescript
// ✅ Good: Let TypeScript infer types
const response = await api.users({ id: "123" }).get();
const user = response.data; // Fully typed

// ❌ Avoid: Manual type casting
const user = response.data as User;
```

### 3. Handle API Changes Gracefully

```typescript
// ✅ Good: Type-safe optional chaining
if (response.data?.success && response.data.user) {
	// TypeScript knows user exists here
	setUser(response.data.user);
}

// ❌ Avoid: Unsafe property access
if (response.success && response.user) {
	setUser(response.user); // Might be undefined
}
```

### 4. Use Path Aliases Consistently

```typescript
// ✅ Good: Consistent imports
import { api } from "@web/lib/eden";
import type { User } from "@api/entities/user.entity";

// ❌ Avoid: Relative imports
import { api } from "../../lib/eden";
import type { User } from "../../../api/src/entities/user.entity";
```

## Common Patterns

### Pagination

```typescript
const getPaginatedUsers = async (page: number, limit: number) => {
	const response = await api.users.get({
		query: {
			offset: page * limit,
			limit,
		},
	});

	return {
		users: response.data?.data || [],
		pagination: response.data?.pagination,
		hasMore: response.data?.pagination?.hasMore || false,
	};
};
```

### File Uploads

```typescript
const uploadDocument = async (file: File, studentId: string) => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("studentId", studentId);

	const response = await api.documents.post(formData);
	return response.data;
};
```

### Real-time Updates (Future)

```typescript
// When WebSocket support is added
const ws = api.ws.connect();

ws.on("shift:updated", (data) => {
	// Fully typed real-time updates
	updateShift(data);
});
```

## Troubleshooting

### Type Inference Issues

**Problem**: Types not being inferred correctly.

**Solutions**:

1. Ensure `strict: true` in tsconfig.json
2. Check that Elysia versions match between frontend and backend
3. Verify path aliases are configured correctly
4. Use TypeScript 5.0+ for best inference

### Monorepo Type Issues

**Problem**: Multiple copies of Elysia causing type conflicts.

**Solution**:

1. Move `elysia` and `@elysiajs/eden` to root package.json
2. Remove from sub-packages
3. Delete all node_modules and reinstall from root

### API Changes Not Reflected

**Problem**: Frontend types not updating with API changes.

**Solution**:

1. Restart TypeScript server in your IDE
2. Clear TypeScript cache
3. Ensure backend is running and accessible

## Future Considerations

### When to Add Abstractions

Consider adding abstractions when you have:

- **Cross-cutting concerns** (logging, error handling, retries)
- **Complex business logic** combining multiple API calls
- **Different interfaces** for different parts of your app
- **Repeated patterns** (3+ times)

### Domain-Driven Design

When your domain becomes complex, consider:

- **Domain types** separate from API types
- **Mapping functions** between API and domain
- **Business logic** in domain services
- **Value objects** for complex data

### Performance Optimization

For high-traffic applications:

- **Request caching** with React Query or SWR
- **Optimistic updates** for better UX
- **Request deduplication** to avoid duplicate calls
- **Background sync** for offline support

---

This architecture prioritizes simplicity, type safety, and developer experience while maintaining flexibility for future growth.
