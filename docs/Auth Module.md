# Authentication & Authorization Module

## Overview

The Preceptoria Auth Module provides comprehensive user authentication and authorization for the platform. The current implementation uses **JWT-based authentication** with **Role-Based Access Control (RBAC)** to manage access to resources based on user roles. The system is designed to support future social authentication integration.

## Current Implementation

### Authentication System

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Local Authentication**: Email and password-based login
- **Token Management**: Short-lived access tokens (15 minutes) with refresh token rotation
- **Secure Cookies**: HTTP-only cookies for token storage

### User Roles & Permissions

The system implements six distinct user roles with hierarchical permissions:

#### SysAdmin
- **Full System Access**: `*:*:*` permission (all resources, all actions)
- **Administrative Control**: Complete system management capabilities

#### OrgAdmin
- **Managed Resources**: Access to hospitals, schools, courses, and classes under their organization
- **Document Management**: Full document management capabilities
- **Administrative Oversight**: System-wide administrative functions

#### Supervisor (MVP Focus)
- **Own Classes**: Create, read, update, delete their assigned classes
- **Own Students**: Manage students within their assigned classes
- **Student Documents**: Upload, read, update, delete documents on behalf of students
- **Hospital Access**: View hospitals where their students have shifts

#### HospitalManager
- **Own Shifts**: Read shifts at their managed hospitals
- **Own Students**: Read student information for their hospital shifts
- **Document Access**: Read access to relevant documents
- **Class Access**: Read access to classes with students at their hospitals

#### Preceptor
- **Own Shifts**: Read shifts they are assigned to
- **Own Students**: Read student information for their shifts
- **Hospital Access**: Read access to hospitals where they work

#### Student
- **Own Documents**: Create, read, update, delete their own documents
- **Own Classes**: Read access to their assigned class
- **Own Shifts**: Read access to their assigned shifts
- **Own Profile**: Read and update their own information

## Permission System

### Permission Structure

Permissions follow the pattern: `Resource:Action_Modifier`

- **Resources**: Hospital, Student, School, Course, Classes, Document, Shift
- **Actions**: Create, Read, Update, Delete
- **Modifiers**: Own, Managed, Students

### Permission Examples

```typescript
// Supervisor can read their own classes
"Classes:Read_Own"

// OrgAdmin can manage all hospitals
"Hospital:Read_Managed"

// Supervisor can manage documents on behalf of students
"Document:Create_Students"
```

### Ownership Resolution

The system includes sophisticated ownership resolvers that determine access based on:

- **Direct Ownership**: User owns the resource directly
- **Managed Access**: User manages the resource through organizational hierarchy
- **Student Representation**: User can act on behalf of students under their supervision

## Security Features

### Current Implementation

- **Password Hashing**: Secure password hashing using Bun's built-in password utilities
- **JWT Tokens**: Secure token generation with environment-defined secrets
- **HTTP-Only Cookies**: Secure cookie storage for tokens
- **CORS Protection**: Cross-origin request protection
- **Input Validation**: Comprehensive request validation using Elysia's type system

### Token Management

```typescript
// Access Token (15 minutes)
const accessToken = await jwt.sign({
  id: user.id,
  roles: user.roles.toString(),
});

// Refresh Token (7 days)
const refreshToken = await jwt.sign({
  id: user.id,
  roles: user.roles.toString(),
  exp: "7d",
});
```

## API Endpoints

### Authentication Endpoints

#### POST `/auth/signup`
Create a new user account.

**Request Body:**
```typescript
{
  name: string;
  email: string;
  phone: string;
  password: string; // min 6 characters
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
```

#### POST `/auth/signin`
Authenticate with email and password.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
```

### Authorization Middleware

The system uses middleware to enforce permissions:

```typescript
// Example: Check if user can read a specific document
const hasAccess = await hasPermission(
  requester,
  Resource.Document,
  Actions.Read,
  documentId
);
```

## Environment Configuration

Required environment variables:

```bash
# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=preceptoria_dev

# Application Configuration
NODE_ENV=development
```

## Development Setup

### Local Development

```bash
# Install dependencies
cd packages/elysia
bun install

# Setup environment
cp env.example .env
# Edit .env with your database credentials

# Start development server
bun run dev
```

### Testing Authentication

```bash
# Run authentication tests
bun run test src/controllers/auth.test.ts

# Run permission tests
bun run test src/utils/hasPermissions.test.ts
```

## Future Enhancements

### Planned Features

#### Social Authentication
- **Google OAuth**: Integration with Google authentication
- **Additional Providers**: Support for Facebook, GitHub, etc.
- **Hybrid Authentication**: Users can link social and local accounts

#### Enhanced Security
- **Multi-Factor Authentication (MFA)**: Additional security layer
- **Rate Limiting**: Protection against brute force attacks
- **Session Management**: Advanced session tracking and management

#### Advanced Features
- **Invitation System**: Role-based user invitations
- **Audit Logging**: Comprehensive activity tracking
- **Token Revocation**: Advanced token management with blacklisting

### Integration Plans

#### Supabase Integration (Future)
- **Row Level Security (RLS)**: Database-level access control
- **Supabase Auth**: Leverage Supabase authentication features
- **IAM Integration**: Advanced identity and access management

## Code Examples

### Permission Check Implementation

```typescript
// Check if user can read a specific student
const canReadStudent = await hasPermission(
  user,
  Resource.Student,
  Actions.Read,
  studentId
);

if (!canReadStudent) {
  throw new Error("Access denied");
}
```

### Role-Based Route Protection

```typescript
// Example controller with role-based access
const studentsController = new Elysia({ prefix: "/students" })
  .use(authMiddleware)
  .get("/:id", async ({ params, user }) => {
    const hasAccess = await hasPermission(
      user,
      Resource.Student,
      Actions.Read,
      params.id
    );
    
    if (!hasAccess) {
      return error(403, { message: "Access denied" });
    }
    
    // Proceed with student data retrieval
  });
```

## Best Practices

### Security Guidelines

1. **Always validate permissions** before accessing resources
2. **Use HTTPS in production** for secure token transmission
3. **Implement proper error handling** for authentication failures
4. **Log authentication events** for security monitoring
5. **Regular token rotation** to minimize security risks

### Development Guidelines

1. **Test permission scenarios** thoroughly
2. **Use type-safe permission checks** with TypeScript
3. **Implement proper error messages** for debugging
4. **Follow the principle of least privilege** in permission design

## Troubleshooting

### Common Issues

1. **Token Expiration**: Ensure refresh tokens are properly handled
2. **Permission Denied**: Check user roles and resource ownership
3. **CORS Errors**: Verify CORS configuration for frontend integration
4. **Database Connection**: Ensure database is accessible and configured

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

---

This documentation reflects the current JWT-based authentication implementation. As new features are added (social authentication, MFA, etc.), this document will be updated accordingly.