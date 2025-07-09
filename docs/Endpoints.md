# API Endpoints Documentation

## Overview

The Preceptoria API is built with Elysia.js and provides RESTful endpoints for managing the internship system. All endpoints require authentication and implement role-based access control.

The API is designed to work seamlessly with **Eden Treaty** for end-to-end type safety in the frontend application.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.preceptoria.com` (planned)

## Eden Treaty Integration

The frontend application uses Eden Treaty for type-safe API calls. This provides:

- **End-to-end type safety** between frontend and backend
- **Automatic type inference** from API responses
- **Compile-time error detection** for API changes
- **IntelliSense support** in your IDE

### Basic Usage

```typescript
import { api } from "@web/lib/eden";

// Type-safe API calls
const response = await api.auth.signin.post({
	email: "user@example.com",
	password: "password",
});

// Full type inference
const user = response.data?.user; // Fully typed
```

### Error Handling

```typescript
try {
	const response = await api.users.get({
		query: { limit: 10 },
	});

	if (response.data?.success) {
		// Handle success
		return response.data.data;
	} else {
		// Handle API error
		throw new Error(response.data?.message || "Request failed");
	}
} catch (error) {
	// Handle network/other errors
	console.error("API Error:", error);
}
```

## Authentication

All endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Domain Model

### Entity Relationships

```
Organization (Hospital/School)
    ↓
Course (belongs to School)
    ↓
Classes (belongs to Course)
    ↓
Student (belongs to Class)
    ↓
Document (belongs to Student)
    ↓
Shift (involves Student, Preceptor, Hospital)
```

### Role Hierarchy

- **SysAdmin**: Full system access (`*:*:*`)
- **OrgAdmin**: Organization-level management with operational manager creation
- **Supervisor**: School operations with cross-hospital shift management
- **HospitalManager**: Hospital operations with document approval capabilities
- **Preceptor**: Assigned shift management with teaching context access
- **Student**: Self-management with class-level data access

## API Endpoints

### Authentication

#### POST `/auth/signup`

Create a new user account.

**Request Body:**

```json
{
	"name": "string",
	"email": "string",
	"phone": "string",
	"password": "string"
}
```

**Response:**

```json
{
	"success": true,
	"message": "User created successfully",
	"user": {
		"id": "string",
		"name": "string",
		"email": "string"
	}
}
```

#### POST `/auth/signin`

Authenticate with email and password.

**Request Body:**

```json
{
	"email": "string",
	"password": "string"
}
```

**Response:**

```json
{
	"success": true,
	"message": "User logged in successfully",
	"user": {
		"id": "string",
		"name": "string",
		"email": "string"
	}
}
```

### User Management

#### GET `/users`

Get all users (filtered by permissions).

**Query Parameters:**

- `role`: Filter by user role
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "string",
			"name": "string",
			"email": "string",
			"roles": ["string"],
			"createdAt": "date"
		}
	],
	"pagination": {
		"total": "number",
		"limit": "number",
		"offset": "number"
	}
}
```

#### GET `/users/:id`

Get a specific user by ID.

**Response:**

```json
{
	"success": true,
	"data": {
		"id": "string",
		"name": "string",
		"email": "string",
		"phone": "string",
		"roles": ["string"],
		"createdAt": "date",
		"updatedAt": "date"
	}
}
```

### Student Management

#### GET `/students`

Get all students (filtered by permissions).

**Query Parameters:**

- `classId`: Filter by class
- `supervisorId`: Filter by supervisor
- `limit`: Number of results
- `offset`: Pagination offset

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "string",
			"name": "string",
			"email": "string",
			"class": {
				"id": "string",
				"name": "string"
			},
			"supervisor": {
				"id": "string",
				"name": "string"
			}
		}
	]
}
```

#### POST `/students`

Create a new student (Supervisor only).

**Request Body:**

```json
{
	"name": "string",
	"email": "string",
	"phone": "string",
	"classId": "string"
}
```

#### GET `/students/:id`

Get a specific student by ID.

#### PUT `/students/:id`

Update a student (Supervisor only).

#### DELETE `/students/:id`

Delete a student (Supervisor only).

### Document Management

#### GET `/documents`

Get all documents (filtered by permissions).

**Query Parameters:**

- `studentId`: Filter by student
- `type`: Filter by document type
- `status`: Filter by validation status

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "string",
			"name": "string",
			"type": "string",
			"status": "string",
			"student": {
				"id": "string",
				"name": "string"
			},
			"uploadedBy": {
				"id": "string",
				"name": "string"
			},
			"createdAt": "date"
		}
	]
}
```

#### POST `/documents`

Upload a new document.

**Request Body:**

```json
{
	"name": "string",
	"type": "string",
	"studentId": "string",
	"file": "file"
}
```

#### GET `/documents/:id`

Get a specific document by ID.

#### PUT `/documents/:id`

Update document metadata.

#### DELETE `/documents/:id`

Delete a document.

### Class Management

#### GET `/classes`

Get all classes (filtered by permissions).

**Query Parameters:**

- `courseId`: Filter by course
- `supervisorId`: Filter by supervisor

#### POST `/classes`

Create a new class (Supervisor only).

**Request Body:**

```json
{
	"name": "string",
	"courseId": "string",
	"description": "string"
}
```

#### GET `/classes/:id`

Get a specific class by ID.

#### PUT `/classes/:id`

Update a class (Supervisor only).

#### DELETE `/classes/:id`

Delete a class (Supervisor only).

### Course Management

#### GET `/courses`

Get all courses (filtered by permissions).

#### POST `/courses`

Create a new course (OrgAdmin only).

#### GET `/courses/:id`

Get a specific course by ID.

#### PUT `/courses/:id`

Update a course (OrgAdmin only).

#### DELETE `/courses/:id`

Delete a course (OrgAdmin only).

### Hospital Management

#### GET `/hospitals`

Get all hospitals (filtered by permissions).

#### POST `/hospitals`

Create a new hospital (OrgAdmin only).

#### GET `/hospitals/:id`

Get a specific hospital by ID.

#### PUT `/hospitals/:id`

Update a hospital (OrgAdmin only).

#### DELETE `/hospitals/:id`

Delete a hospital (OrgAdmin only).

### Shift Management

#### GET `/shifts`

Get all shifts (filtered by permissions).

**Query Parameters:**

- `hospitalId`: Filter by hospital
- `preceptorId`: Filter by preceptor
- `studentId`: Filter by student
- `date`: Filter by date

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "string",
			"date": "date",
			"startTime": "time",
			"endTime": "time",
			"hospital": {
				"id": "string",
				"name": "string"
			},
			"preceptor": {
				"id": "string",
				"name": "string"
			},
			"students": [
				{
					"id": "string",
					"name": "string"
				}
			]
		}
	]
}
```

#### POST `/shifts`

Create a new shift (Supervisor only).

**Request Body:**

```json
{
	"date": "date",
	"startTime": "time",
	"endTime": "time",
	"hospitalId": "string",
	"preceptorId": "string",
	"studentIds": ["string"]
}
```

#### GET `/shifts/:id`

Get a specific shift by ID.

#### PUT `/shifts/:id`

Update a shift (Supervisor only).

#### DELETE `/shifts/:id`

Delete a shift (Supervisor only).

### Admin Endpoints

#### GET `/admin/users`

Get all users (SysAdmin only).

#### GET `/admin/stats`

Get system statistics (SysAdmin only).

**Response:**

```json
{
	"success": true,
	"data": {
		"totalUsers": "number",
		"totalStudents": "number",
		"totalShifts": "number",
		"totalDocuments": "number",
		"activeClasses": "number"
	}
}
```

## Error Responses

### Standard Error Format

```json
{
	"success": false,
	"message": "Error description",
	"errors": [
		{
			"field": "string",
			"constraints": {
				"constraint": "error message"
			}
		}
	]
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute per user

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**

- `limit`: Number of items per page (default: 10, max: 100)
- `offset`: Number of items to skip (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number",
    "hasMore": "boolean"
  }
}
```

## Filtering and Sorting

### Filtering

Most list endpoints support filtering by entity properties:

```
GET /students?classId=123&supervisorId=456
GET /shifts?hospitalId=789&date=2024-01-15
```

### Sorting

Sorting is supported on most endpoints:

```
GET /students?sort=name&order=asc
GET /shifts?sort=date&order=desc
```

## WebSocket Support (Planned)

Future versions will include WebSocket endpoints for real-time updates:

- **Document status changes**
- **Shift assignments**
- **System notifications**

## API Versioning

The API uses URL versioning:

```
/api/v1/students
/api/v2/students
```

Current version: **v1**

## SDK and Client Libraries

### TypeScript Client (Planned)

```typescript
import { PreceptoriaClient } from "@preceptoria/client";

const client = new PreceptoriaClient({
	baseUrl: "http://localhost:3000",
	token: "your-jwt-token",
});

const students = await client.students.list();
```

## Testing

### Test Endpoints

- **Health Check**: `GET /health`
- **API Status**: `GET /status`

### Postman Collection

A Postman collection is available for testing all endpoints.

---

This documentation reflects the current API implementation. As new features are added, this document will be updated accordingly.
