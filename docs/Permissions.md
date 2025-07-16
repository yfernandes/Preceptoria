# Role-Based Access Control (RBAC) System

## Overview

The Preceptoria RBAC system implements a sophisticated permission model that enforces access control based on user roles and resource ownership. Uses hierarchical permission structure with ownership resolvers to determine access rights and prevent accidental cross-referencing of data.

## Permission Structure

### Format: `Resource:Action_Modifier`

- **Resource**: The entity being accessed (Hospital, Student, School, Course, Classes, Document, Shift, Supervisor, HospitalManager, Preceptor, Audit)
- **Action**: The operation being performed (Create, Read, Update, Delete, Assign, Compile, Approve)
- **Modifier**: The scope of access (Own, Managed, Students, Assigned, Basic, Class, Bundle)

### Modifiers Explained

- **Own**: User has direct ownership of the resource (prevents cross-user access)
- **Managed**: User manages the resource through organizational hierarchy (prevents cross-organization access)
- **Students**: User can act on behalf of students under their supervision
- **Assigned**: Permission for resources assigned to the user (e.g., shifts for preceptors)
- **Basic**: Limited read access to resource (for cross-organization navigation)
- **Class**: Permission for resources within the same class (prevents cross-class access)
- **Bundle**: Permission for document bundles (approval workflow)

### Actions Explained

- **Create**: Create new resources
- **Read**: Read existing resources
- **Update**: Modify existing resources
- **Delete**: Remove resources
- **Assign**: Assign students/preceptors to shifts
- **Compile**: Compile student documents into bundles
- **Approve**: Approve/reject document bundles

## Current Permission Matrix

| Role | Resource | Permission | Description |
|------|----------|------------|-------------|
| **SysAdmin** | * | `*:*:*` | Full system access |
| **OrgAdmin** | All Resources | `*_Managed` | Organization-wide management |
| **OrgAdmin** | Operational Managers | `*_Managed` | Create/manage Supervisors, HospitalManagers, Preceptors |
| **OrgAdmin** | Audit | `Read_Managed`, `Delete_Managed` | Access logs and delete historical data |
| **Supervisor** | Academic Resources | `*_Own` | Manage courses, classes, students within their school |
| **Supervisor** | Shifts | `*_Own` + `Assign_Own` | Create/manage shifts and assign participants |
| **Supervisor** | Documents | `*_Students` + `Compile_Students` | Manage student documents and compile bundles |
| **Supervisor** | Cross-Org Access | `Read_Basic` | Limited hospital info for shift creation |
| **Supervisor** | Student Info | `Read_Class` | See other students in their classes |
| **HospitalManager** | Hospital | `Read_Own`, `Update_Own` | Manage their hospital data |
| **HospitalManager** | Shifts | `Read_Managed` | Read shifts at their hospital |
| **HospitalManager** | Documents | `Read_Managed`, `Approve_Bundle` | Read and approve document bundles |
| **HospitalManager** | Student/Class Info | `Read_Basic` | Basic info for shifts at their hospital |
| **Preceptor** | Shifts | `Read_Assigned`, `Update_Assigned` | Manage assigned shifts |
| **Preceptor** | Student Info | `Read_Basic` | Basic student info for teaching context |
| **Preceptor** | Hospital Info | `Read_Basic` | Basic hospital info for shifts |
| **Student** | Documents | `*_Own` | Manage their own documents |
| **Student** | Academic Info | `Read_Own` | Read their classes and shifts |
| **Student** | Cross-Org Access | `Read_Basic` | Basic hospital info for navigation |
| **Student** | Classmates | `Read_Class` | See other students in their class |

## Data Isolation Examples

### Supervisor Isolation
```typescript
// Supervisor A can only see students in their own classes
"Student:Read_Own" // Prevents cross-supervisor access

// Supervisor can only see classmates within their classes
"Student:Read_Class" // Prevents cross-class access
```

### Organization Isolation
```typescript
// OrgAdmin can only manage resources within their organization
"Hospital:Read_Managed" // Prevents cross-organization access
"School:Read_Managed"   // Prevents cross-organization access
```

### Cross-Organization Limited Access
```typescript
// Students can see basic hospital info for navigation
"Hospital:Read_Basic" // Limited info for shift locations

// Supervisors can see basic hospital info for shift creation
"Hospital:Read_Basic" // Limited info for scheduling
```

## Implementation Details

### Helper Functions for Clean Permissions

```typescript
// Helper functions to reduce repetition and improve readability
const crud = (resource: Resource, modifier: Modifiers): Perm => [
	`${resource}:Create_${modifier}`,
	`${resource}:Read_${modifier}`,
	`${resource}:Update_${modifier}`,
	`${resource}:Delete_${modifier}`,
];

const readOnly = (resource: Resource, modifier: Modifiers): Perm => [
	`${resource}:Read_${modifier}`,
];

const readUpdate = (resource: Resource, modifier: Modifiers): Perm => [
	`${resource}:Read_${modifier}`,
	`${resource}:Update_${modifier}`,
];
```

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
    const assignedKey = `${resource}:${action}_Assigned`;
    const basicKey = `${resource}:${action}_Basic`;
    const classKey = `${resource}:${action}_Class`;
    const bundleKey = `${resource}:${action}_Bundle`;

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

    // Check assigned resources
    if (permissions.includes(assignedKey)) {
      const checkAssigned = resolvers[role][resource]?.Assigned;
      if (checkAssigned && await checkAssigned(requester, resourceId)) {
        return true;
      }
    }

    // Check basic access
    if (permissions.includes(basicKey)) {
      const checkBasic = resolvers[role][resource]?.Basic;
      if (checkBasic && await checkBasic(requester, resourceId)) {
        return true;
      }
    }

    // Check class access
    if (permissions.includes(classKey)) {
      const checkClass = resolvers[role][resource]?.Class;
      if (checkClass && await checkClass(requester, resourceId)) {
        return true;
      }
    }

    // Check bundle access
    if (permissions.includes(bundleKey)) {
      const checkBundle = resolvers[role][resource]?.Bundle;
      if (checkBundle && await checkBundle(requester, resourceId)) {
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

## Role Hierarchy & Responsibilities

### Administrative Hierarchy
```
SysAdmin (Full Access)
    ↓
OrgAdmin (Organization Management)
    ↓
Supervisor (School Operations)
    ↓
Student (Self Management)
```

### Hospital Hierarchy
```
OrgAdmin (Hospital Management)
    ↓
HospitalManager (Hospital Operations)
    ↓
Preceptor (Shift Management)
    ↓
Student (Shift Participation)
```

### Operational Flow
1. **OrgAdmin** creates operational managers (Supervisors, HospitalManagers, Preceptors)
2. **Supervisor** creates courses, classes, students, and manages shifts across hospitals
3. **HospitalManager** provides hospital data and approves document bundles
4. **Preceptor** manages assigned shifts and teaches students
5. **Student** submits documents and participates in shifts

## Security Considerations

### Data Isolation
- **Hospital Scoping**: HospitalManagers can only access data related to their hospitals
- **School Scoping**: Supervisors can only access data related to their schools
- **Class Scoping**: Students can only access data related to their classes
- **Cross-Organization Access**: Limited to basic navigation info only

### Permission Inheritance
- **SysAdmin**: Inherits all permissions
- **OrgAdmin**: Inherits managed permissions for their organization
- **Supervisor**: Inherits permissions for their assigned classes and students

### Audit Trail
- All permission checks are logged for security monitoring
- Failed access attempts are tracked
- Resource access patterns are monitored
- Only OrgAdmins can delete historical data (compliance requirement)

## Document Workflow

### Student-Supervisor Document Flow
1. **Student** submits documents (`Document:Create_Own`)
2. **Supervisor** manages student documents (`Document:*_Students`)
3. **Supervisor** compiles documents into bundles (`Document:Compile_Students`)
4. **HospitalManager** approves/rejects bundles (`Document:Approve_Bundle`)

### Shift Management Flow
1. **Supervisor** creates shifts at hospitals (`Shift:Create_Own`)
2. **Supervisor** assigns students and preceptors (`Shift:Assign_Own`)
3. **Preceptor** manages assigned shifts (`Shift:*_Assigned`)
4. **Student** views their shifts (`Shift:Read_Own`)

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

// Test cross-class isolation
test("student cannot see students from other classes", async () => {
  const student = createTestUser({ role: "Student", classId: "class1" });
  const otherStudent = createTestStudent({ classId: "class2" });
  
  const hasAccess = await hasPermission(
    student,
    Resource.Student,
    Actions.Read,
    otherStudent.id
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
- **Emergency Access**: Temporary elevated permissions for urgent situations

---

This permission system provides a robust foundation for secure, role-based access control while maintaining flexibility for future enhancements and organizational changes. The granular approach ensures data isolation and prevents accidental cross-referencing while supporting the complex operational workflows of the internship management system.
