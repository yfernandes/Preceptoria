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

The system implements six distinct user roles with hierarchical permissions designed to prevent accidental cross-referencing of data:

#### SysAdmin
- **Full System Access**: `*:*:*` permission (all resources, all actions)
- **Administrative Control**: Complete system management capabilities

#### OrgAdmin
- **Organization-Wide Management**: Access to all resources within their organization using `*_Managed` permissions
- **Operational Manager Creation**: Can create and manage Supervisors, HospitalManagers, and Preceptors
- **Audit Access**: Can access logs and delete historical data (compliance requirement)
- **Data Isolation**: Cannot access resources from other organizations

#### Supervisor (MVP Focus)
- **Academic Resources**: Manage courses, classes, students within their school using `*_Own` permissions
- **Cross-Hospital Shift Management**: Create and manage shifts across hospitals, assign students and preceptors
- **Student Document Management**: Upload, read, update, delete documents on behalf of students using `*_Students` permissions
- **Document Compilation**: Compile student documents into bundles for hospital approval
- **Limited Cross-Organization Access**: Basic hospital info for shift creation using `Read_Basic` permissions
- **Class-Level Data Access**: Can see other students in their classes using `Read_Class` permissions

#### HospitalManager
- **Hospital Operations**: Manage their hospital data using `*_Own` permissions
- **Shift Oversight**: Read shifts assigned to their hospital using `Read_Managed` permissions
- **Document Approval**: Read and approve/reject document bundles using `Approve_Bundle` permissions
- **Student/Class Info**: Basic access to student and class information for shifts at their hospital
- **Data Isolation**: Cannot access data from other hospitals

#### Preceptor
- **Assigned Shift Management**: Read and update shifts they're assigned to using `*_Assigned` permissions
- **Teaching Context**: Basic access to student and hospital information for their teaching context
- **Data Isolation**: Cannot access shifts they're not assigned to

#### Student
- **Personal Document Management**: Create, read, update, delete their own documents using `*_Own` permissions
- **Academic Access**: Read access to their classes and shifts using `Read_Own` permissions
- **Cross-Organization Navigation**: Basic hospital info for navigation using `Read_Basic` permissions
- **Classmate Visibility**: Can see other students in their class using `Read_Class` permissions
- **Data Isolation**: Cannot access documents or data from other students

## Permission System

### Permission Structure

Permissions follow the pattern: `Resource:Action_Modifier`

- **Resources**: Hospital, Student, School, Course, Classes, Document, Shift, Supervisor, HospitalManager, Preceptor, Audit
- **Actions**: Create, Read, Update, Delete, Assign, Compile, Approve
- **Modifiers**: Own, Managed, Students, Assigned, Basic, Class, Bundle

### Permission Examples

```typescript
// Supervisor can read their own classes (prevents cross-supervisor access)
"Classes:Read_Own"

// OrgAdmin can manage all hospitals in their organization (prevents cross-organization access)
"Hospital:Read_Managed"

// Supervisor can manage documents on behalf of students
"Document:Create_Students"

// Supervisor can assign students to shifts
"Shift:Assign_Own"

// Supervisor can compile student documents into bundles
"Document:Compile_Students"

// HospitalManager can approve document bundles
"Document:Approve_Bundle"

// Student can see classmates (prevents cross-class access)
"Student:Read_Class"

// Preceptor can manage assigned shifts
"Shift:Read_Assigned"
```

### Ownership Resolution

The system includes sophisticated ownership resolvers that determine access based on:

- **Direct Ownership**: User owns the resource directly (prevents cross-user access)
- **Managed Access**: User manages the resource through organizational hierarchy (prevents cross-organization access)
- **Student Representation**: User can act on behalf of students under their supervision
- **Assigned Access**: User has access to resources assigned to them (e.g., shifts for preceptors)
- **Basic Access**: Limited read access for cross-organization navigation
- **Class Access**: Access to resources within the same class (prevents cross-class access)
- **Bundle Access**: Access to document bundles for approval workflow

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