import { and, eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import {
	classes,
	courses,
	documents,
	hospitalManagers,
	hospitals,
	internshipPlacements,
	organizations,
	preceptors,
	shifts,
	students,
	supervisors,
	user,
} from "$lib/server/db/schema";

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
	OrgAdmin = "OrgAdmin",
}

export enum Actions {
	Create = "Create",
	Read = "Read",
	Update = "Update",
	Delete = "Delete",
	Assign = "Assign",
	Compile = "Compile",
	Approve = "Approve",
}

export enum Modifiers {
	Own = "Own",
	Managed = "Managed",
	Students = "Students",
	Assigned = "Assigned",
	Basic = "Basic",
	Class = "Class",
	Bundle = "Bundle",
}

type Perm = `${Resource}:${Actions}_${Modifiers}` | "*:*:*";

const crud = (resource: Resource, modifier: Modifiers): Perm[] => [
	`${resource}:Create_${modifier}`,
	`${resource}:Read_${modifier}`,
	`${resource}:Update_${modifier}`,
	`${resource}:Delete_${modifier}`,
];

const readOnly = (resource: Resource, modifier: Modifiers): Perm[] => [
	`${resource}:Read_${modifier}`,
];

const readUpdate = (resource: Resource, modifier: Modifiers): Perm[] => [
	`${resource}:Read_${modifier}`,
	`${resource}:Update_${modifier}`,
];

export const rolesPermissions: Record<string, Perm[]> = {
	SysAdmin: ["*:*:*", ...crud(Resource.OrgAdmin, Modifiers.Managed)],
	OrgAdmin: [
		...crud(Resource.User, Modifiers.Managed),
		...crud(Resource.OrgAdmin, Modifiers.Managed),
		...readUpdate(Resource.Hospital, Modifiers.Managed),
		...readUpdate(Resource.School, Modifiers.Managed),
		...crud(Resource.Course, Modifiers.Managed),
		...crud(Resource.Classes, Modifiers.Managed),
		...crud(Resource.Student, Modifiers.Managed),
		...crud(Resource.Shift, Modifiers.Managed),
		...readUpdate(Resource.Document, Modifiers.Managed),
		...crud(Resource.Supervisor, Modifiers.Managed),
		...crud(Resource.HospitalManager, Modifiers.Managed),
		...crud(Resource.Preceptor, Modifiers.Managed),
		...readOnly(Resource.Audit, Modifiers.Managed),
		`${Resource.Audit}:Delete_${Modifiers.Managed}`,
	],
	Supervisor: [
		...readOnly(Resource.User, Modifiers.Managed),
		...crud(Resource.Course, Modifiers.Own),
		...crud(Resource.Classes, Modifiers.Own),
		...crud(Resource.Student, Modifiers.Own),
		...crud(Resource.Shift, Modifiers.Own),
		`${Resource.Shift}:Assign_${Modifiers.Own}`,
		...crud(Resource.Document, Modifiers.Students),
		`${Resource.Document}:Compile_${Modifiers.Students}`,
		...readOnly(Resource.Hospital, Modifiers.Basic),
		...readOnly(Resource.Student, Modifiers.Class),
		...readOnly(Resource.Audit, Modifiers.Own),
	],
	HospitalManager: [
		...readUpdate(Resource.Hospital, Modifiers.Own),
		...readOnly(Resource.Shift, Modifiers.Managed),
		...readOnly(Resource.Student, Modifiers.Basic),
		...readOnly(Resource.Classes, Modifiers.Basic),
		...readOnly(Resource.Document, Modifiers.Managed),
		`${Resource.Document}:Approve_${Modifiers.Bundle}`,
		...readOnly(Resource.Audit, Modifiers.Own),
	],
	Preceptor: [
		...readUpdate(Resource.Shift, Modifiers.Assigned),
		...readOnly(Resource.Hospital, Modifiers.Basic),
		...readOnly(Resource.Student, Modifiers.Basic),
		...readOnly(Resource.Audit, Modifiers.Own),
	],
	Student: [
		...crud(Resource.Document, Modifiers.Own),
		...readOnly(Resource.Classes, Modifiers.Own),
		...readOnly(Resource.Shift, Modifiers.Own),
		...readOnly(Resource.Hospital, Modifiers.Basic),
		...readOnly(Resource.Student, Modifiers.Class),
	],
};

type OwnershipResolver = (
	user: any,
	resourceId: string,
) => Promise<boolean> | boolean;

const resolvers: Record<
	string,
	Partial<Record<Resource, Partial<Record<Modifiers, OwnershipResolver>>>>
> = {
	SysAdmin: {},
	OrgAdmin: {
		Document: { Managed: () => true },
		Student: { Managed: () => true },
		Hospital: { Managed: () => true },
		School: { Managed: () => true },
		Course: { Managed: () => true },
		Classes: { Managed: () => true },
	},
	HospitalManager: {
		Student: {
			Own: async (user, resourceId) => {
				const mgr = await db.query.hospitalManagers.findFirst({
					where: eq(hospitalManagers.userId, user.id),
				});
				if (!mgr) return false;
				// Check if student has a placement at this hospital
				const placement = await db.query.internshipPlacements.findFirst({
					where: and(
						eq(internshipPlacements.studentId, resourceId),
						eq(internshipPlacements.hospitalId, mgr.hospitalId),
					),
				});
				return !!placement;
			},
		},
		Shift: {
			Own: async (user, resourceId) => {
				const mgr = await db.query.hospitalManagers.findFirst({
					where: eq(hospitalManagers.userId, user.id),
				});
				if (!mgr) return false;
				const s = await db.query.shifts.findFirst({
					where: eq(shifts.id, resourceId),
				});
				return s?.hospitalId === mgr.hospitalId;
			},
		},
		Document: { Managed: () => true },
		Classes: { Managed: () => true },
	},
	Supervisor: {
		Student: {
			Own: async (user, resourceId) => {
				const sup = await db.query.supervisors.findFirst({
					where: eq(supervisors.userId, user.id),
				});
				if (!sup) return false;
				const studentEntry = await db.query.students.findFirst({
					where: eq(students.id, resourceId),
					with: { class: { with: { course: true } } },
				});
				return studentEntry?.class.course.schoolId === sup.schoolId;
			},
		},
		Document: {
			Students: async (user, resourceId) => {
				const sup = await db.query.supervisors.findFirst({
					where: eq(supervisors.userId, user.id),
				});
				if (!sup) return false;
				const doc = await db.query.documents.findFirst({
					where: eq(documents.id, resourceId),
					with: { student: { with: { class: { with: { course: true } } } } },
				});
				return doc?.student.class.course.schoolId === sup.schoolId;
			},
		},
	},
	Student: {
		Document: {
			Own: async (user, resourceId) => {
				const studentEntry = await db.query.students.findFirst({
					where: eq(students.userId, user.id),
				});
				if (!studentEntry) return false;
				const doc = await db.query.documents.findFirst({
					where: eq(documents.id, resourceId),
				});
				return doc?.studentId === studentEntry.id;
			},
		},
		Student: {
			Own: async (user, resourceId) => {
				const studentEntry = await db.query.students.findFirst({
					where: eq(students.userId, user.id),
				});
				return studentEntry?.id === resourceId;
			},
		},
	},
};

export async function hasPermission(
	user: any,
	resource: Resource,
	action: Actions,
	resourceId: string = "",
): Promise<boolean> {
	if (!user || !user.role) return false;

	const permissions = rolesPermissions[user.role] || [];

	if (permissions.includes("*:*:*")) return true;

	const modifiers = [
		Modifiers.Own,
		Modifiers.Managed,
		Modifiers.Students,
		Modifiers.Assigned,
		Modifiers.Basic,
		Modifiers.Class,
		Modifiers.Bundle,
	];

	for (const modifier of modifiers) {
		if (permissions.includes(`${resource}:${action}_${modifier}`)) {
			const resolver = resolvers[user.role]?.[resource]?.[modifier];
			if (!resolver) {
				// If no resolver defined for this modifier, default to true (legacy behavior for some modifiers)
				// But let's be strict for Own/Managed/Students
				if (
					[Modifiers.Own, Modifiers.Managed, Modifiers.Students].includes(
						modifier,
					)
				) {
					return false;
				}
				return true;
			}
			if (await resolver(user, resourceId)) {
				return true;
			}
		}
	}

	return false;
}
