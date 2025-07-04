import { UserRoles } from "../entities/role.abstract";
export enum Resource {
	Hospital = "Hospital",
	Student = "Student",
	School = "School",
	Course = "Course",
	Classes = "Classes",
	Document = "Document",
	Shift = "Shift",
	Supervisor = "Supervisor",
	HospitalManager = "HospitalManager",
	Preceptor = "Preceptor",
	User = "User",
	Audit = "Audit",
}
export enum Actions {
	Create = "Create",
	Read = "Read",
	Update = "Update",
	Delete = "Delete",
	Assign = "Assign", // For assigning students/preceptors to shifts
	Compile = "Compile", // For compiling documents into bundles
	Approve = "Approve", // For approving document bundles
}

export enum Modifiers {
	Own = "Own", // User's own resources
	Managed = "Managed", // Resources within user's organization
	Students = "Students", // Permission to do something on behalf of students
	Assigned = "Assigned", // Resources assigned to the user (e.g., shifts)
	Basic = "Basic", // Limited read access to resource
	Class = "Class", // Resources within the same class (prevents cross-class access)
	Bundle = "Bundle", // Document bundles for approval workflow
}

type Perm = (`${Resource}:${Actions}_${Modifiers}` | "*:*:*")[];

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

export const rolesPermissions: Record<keyof typeof UserRoles, Perm> = {
	SysAdmin: ["*:*:*"],
	OrgAdmin: [
		// User management
		...crud(Resource.User, Modifiers.Managed),

		// Organization-wide management (prevents cross-organization access)
		...readUpdate(Resource.Hospital, Modifiers.Managed),
		...readUpdate(Resource.School, Modifiers.Managed),
		...crud(Resource.Course, Modifiers.Managed),
		...crud(Resource.Classes, Modifiers.Managed),
		...crud(Resource.Student, Modifiers.Managed),
		...crud(Resource.Shift, Modifiers.Managed),
		...readUpdate(Resource.Document, Modifiers.Managed), // For future document approval

		// Operational manager management
		...crud(Resource.Supervisor, Modifiers.Managed),
		...crud(Resource.HospitalManager, Modifiers.Managed),
		...crud(Resource.Preceptor, Modifiers.Managed),

		// Audit and compliance
		...readOnly(Resource.Audit, Modifiers.Managed),
		`${Resource.Audit}:Delete_${Modifiers.Managed}`,
	],
	Supervisor: [
		// User management (for students in their classes)
		...readOnly(Resource.User, Modifiers.Managed),

		// School operations (prevents cross-supervisor access)
		...crud(Resource.Course, Modifiers.Own),
		...crud(Resource.Classes, Modifiers.Own),
		...crud(Resource.Student, Modifiers.Own),

		// Cross-hospital shift management
		...crud(Resource.Shift, Modifiers.Own),
		`${Resource.Shift}:Assign_${Modifiers.Own}`, // Assign students and preceptors

		// Student document management
		...crud(Resource.Document, Modifiers.Students),
		`${Resource.Document}:Compile_${Modifiers.Students}`, // Compile bundles

		// Cross-organization access (limited)
		...readOnly(Resource.Hospital, Modifiers.Basic), // For shift creation
		...readOnly(Resource.Student, Modifiers.Class), // See classmates only
		...readOnly(Resource.Audit, Modifiers.Own),
	],
	HospitalManager: [
		// Hospital operations
		...readUpdate(Resource.Hospital, Modifiers.Own),

		// Shift oversight (hospital-specific)
		...readOnly(Resource.Shift, Modifiers.Managed),

		// Student/class info for shifts at this hospital
		...readOnly(Resource.Student, Modifiers.Basic),
		...readOnly(Resource.Classes, Modifiers.Basic),

		// Document approval workflow
		...readOnly(Resource.Document, Modifiers.Managed),
		`${Resource.Document}:Approve_${Modifiers.Bundle}`,

		// Audit access
		...readOnly(Resource.Audit, Modifiers.Own),
	],
	Preceptor: [
		// Assigned shift management
		...readUpdate(Resource.Shift, Modifiers.Assigned),

		// Basic access for teaching context
		...readOnly(Resource.Hospital, Modifiers.Basic),
		...readOnly(Resource.Student, Modifiers.Basic),

		// Audit access
		...readOnly(Resource.Audit, Modifiers.Own),
	],
	Student: [
		// Personal document management
		...crud(Resource.Document, Modifiers.Own),

		// Academic access
		...readOnly(Resource.Classes, Modifiers.Own),
		...readOnly(Resource.Shift, Modifiers.Own),

		// Cross-organization access (limited)
		...readOnly(Resource.Hospital, Modifiers.Basic), // For navigation
		...readOnly(Resource.Student, Modifiers.Class), // See classmates only
	],
} as const;
