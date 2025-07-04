# Role-Based Access Control (RBAC) System

## Overview

The Preceptoria RBAC system implements a sophisticated permission model that enforces access control based on user roles and resource ownership. The system uses a hierarchical permission structure with ownership resolvers to determine access rights.

## Permission Structure

### Format: `Resource:Action_Modifier`

- **Resource**: The entity being accessed (Hospital, Student, School, Course, Classes, Document, Shift)
- **Action**: The operation being performed (Create, Read, Update, Delete)
- **Modifier**: The scope of access (Own, Managed, Students)

### Modifiers Explained

- **Own**: User has direct ownership of the resource
- **Managed**: User manages the resource through organizational hierarchy
- **Students**: User can act on behalf of students under their supervision

## Current Permission Matrix

| Role | Resource | Permission | Description |
|------|----------|------------|-------------|
| **SysAdmin** | * | `*:*:*` | Full system access |
| **OrgAdmin** | Hospital | `Read_Managed`, `Update_Managed` | Manage hospitals in their organization |
| **OrgAdmin** | School | `Read_Managed`, `Update_Managed` | Manage schools in their organization |
| **OrgAdmin** | Course | `Create_Managed`, `Read_Managed`, `Update_Managed`, `Delete_Managed` | Full course management |
| **OrgAdmin** | Classes | `Create_Managed`, `Read_Managed`, `Update_Managed`, `Delete_Managed` | Full class management |
| **Supervisor** | Classes | `Create_Own`, `Read_Own`, `Update_Own`, `Delete_Own` | Manage their assigned classes |
| **Supervisor** | Student | `Create_Own`, `Read_Own`, `Update_Own`, `Delete_Own` | Manage students in their classes |
| **Supervisor** | Document | `Create_Students`, `Read_Students`, `Update_Students`, `Delete_Students` | Manage documents on behalf of students |
| **HospitalManager** | Student | `Read_Own` | Read students with shifts at their hospitals |
| **HospitalManager** | Shift | `Read_Own` | Read shifts at their managed hospitals |
| **HospitalManager** | Document | `Read_Managed` | Read access to relevant documents |
| **HospitalManager** | Classes | `Read_Managed` | Read classes with students at their hospitals |
| **Preceptor** | Student | `Read_Own` | Read students in their shifts |
| **Preceptor** | Shift | `Read_Own` | Read their assigned shifts |
| **Preceptor** | Hospital | `Read_Own` | Read hospitals where they work |
| **Student** | Document | `Create_Own`, `Read_Own`, `Update_Own`, `Delete_Own` | Manage their own documents |
| **Student** | Classes | `Read_Own` | Read their assigned class |
| **Student** | Shift | `Read_Own` | Read their assigned shifts |
| **Student** | Student | `Read_Own`, `Update_Own` | Read and update their own profile |

## Ownership Resolution

### How Ownership is Determined

The system uses sophisticated resolvers to determine resource ownership:

#### Supervisor Ownership Examples

```typescript
// Supervisor can read students in their classes
Student: {
  Own: async (requester, resourceId) => {
    const student = await db.student.findOne({ id: resourceId });
    return student?.class.course.supervisor.id === requester.supervisorId;
  }
}

// Supervisor can manage documents on behalf of their students
Document: {
  Students: async (requester, resourceId) => {
    const document = await db.document.findOne({ id: resourceId });
    return document?.student.class.course.supervisor.id === requester.supervisorId;
  }
}
```

#### HospitalManager Ownership Examples

```typescript
// HospitalManager can read shifts at their hospitals
Shift: {
  Own: async (requester, resourceId) => {
    const shift = await db.shift.findOne({ id: resourceId });
    return shift?.hospital.manager.exists(
      (manager) => manager.id === requester.hospitalManagerId
    ) ?? false;
  }
}
```

#### Student Ownership Examples

```typescript
// Student can manage their own documents
Document: {
  Own: async (requester, resourceId) => {
    const document = await db.document.findOne({ id: resourceId });
    return document?.student.id === requester.studentId;
  }
}
```

## Implementation Details

### Permission Check Function

```typescript
export async function hasPermission(
  requester: CachedUserType,
  resource: Resource,
  action: Actions,
  resourceId: string
): Promise<boolean> {
  for (const role of requester.roles) {
    const permissions = rolesPermissions[role];

    // Full access check
    if (permissions.includes("*:*:*")) return true;

    // Check specific permissions with modifiers
    const permissionKey = `${resource}:${action}_Own`;
    const managedKey = `${resource}:${action}_Managed`;
    const studentsKey = `${resource}:${action}_Students`;

    // Check own resources
    if (permissions.includes(permissionKey)) {
      const checkOwnership = resolvers[role][resource]?.Own;
      if (checkOwnership && await checkOwnership(requester, resourceId)) {
        return true;
      }
    }

    // Check managed resources
    if (permissions.includes(managedKey)) {
      const checkManaged = resolvers[role][resource]?.Managed;
      if (checkManaged && await checkManaged(requester, resourceId)) {
        return true;
      }
    }

    // Check student representation
    if (permissions.includes(studentsKey)) {
      const checkStudents = resolvers[role][resource]?.Students;
      if (checkStudents && await checkStudents(requester, resourceId)) {
        return true;
      }
    }
  }

  return false;
}
```

### Usage in Controllers

```typescript
// Example: Student controller with permission checks
const studentsController = new Elysia({ prefix: "/students" })
  .use(authMiddleware)
  .get("/:id", async ({ params, user }) => {
    // Check if user can read this student
    const hasAccess = await hasPermission(
      user,
      Resource.Student,
      Actions.Read,
      params.id
    );

    if (!hasAccess) {
      return error(403, { message: "Access denied" });
    }

    // Proceed with student retrieval
    const student = await db.student.findOne({ id: params.id });
    return { success: true, data: student };
  });
```

## Role Hierarchy

### Administrative Hierarchy
```
SysAdmin (Full Access)
    ↓
OrgAdmin (Organization Management)
    ↓
Supervisor (Class & Student Management)
    ↓
Student (Self Management)
```

### Hospital Hierarchy
```
HospitalManager (Hospital Management)
    ↓
Preceptor (Shift Management)
    ↓
Student (Shift Participation)
```

## Security Considerations

### Data Isolation
- **Hospital Scoping**: HospitalManagers can only access data related to their hospitals
- **School Scoping**: Supervisors can only access data related to their schools
- **Class Scoping**: Students can only access data related to their classes

### Permission Inheritance
- **SysAdmin**: Inherits all permissions
- **OrgAdmin**: Inherits managed permissions for their organization
- **Supervisor**: Inherits permissions for their assigned classes and students

### Audit Trail
- All permission checks are logged for security monitoring
- Failed access attempts are tracked
- Resource access patterns are monitored

## Testing Permissions

### Test Examples

```typescript
// Test supervisor can access their students
test("supervisor can read their own students", async () => {
  const supervisor = createTestUser({ role: "Supervisor", supervisorId: "sup1" });
  const student = createTestStudent({ class: { course: { supervisor: { id: "sup1" } } } });
  
  const hasAccess = await hasPermission(
    supervisor,
    Resource.Student,
    Actions.Read,
    student.id
  );
  
  expect(hasAccess).toBe(true);
});

// Test supervisor cannot access other students
test("supervisor cannot read other students", async () => {
  const supervisor = createTestUser({ role: "Supervisor", supervisorId: "sup1" });
  const student = createTestStudent({ class: { course: { supervisor: { id: "sup2" } } } });
  
  const hasAccess = await hasPermission(
    supervisor,
    Resource.Student,
    Actions.Read,
    student.id
  );
  
  expect(hasAccess).toBe(false);
});
```

## Future Enhancements

### Planned Improvements
- **Dynamic Permissions**: Runtime permission modification
- **Permission Groups**: Group-based permission assignment
- **Temporary Permissions**: Time-limited access grants
- **Permission Analytics**: Usage tracking and optimization

### Advanced Features
- **Conditional Permissions**: Context-based access control
- **Permission Delegation**: Temporary permission transfer
- **Audit Reporting**: Comprehensive access logs and reports

---

This permission system provides a robust foundation for secure, role-based access control while maintaining flexibility for future enhancements and organizational changes.
