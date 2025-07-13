import { db } from "../db";
import { UserRoles } from "../entities/role.abstract";
import { UserContext } from "../types/jwtCookie";
import { Actions, Modifiers, Resource, rolesPermissions } from "./permissions";

export async function hasPermission(
	requester: UserContext,
	resource: Resource,
	action: Actions,
	resourceId: string
): Promise<boolean> {
	for (const role of requester.roles) {
		const permissions = rolesPermissions[role as UserRoles];

		// Full access
		if (permissions.includes("*:*:*")) return true;

		// Own Resources
		if (permissions.includes(`${resource}:${action}_Own`)) {
			const checkOwnership = resolvers[role as UserRoles][resource]?.Own;
			if (!checkOwnership) {
				return false;
			}
			if (await checkOwnership(requester, resourceId)) {
				return true;
			}
		}

		// Scoped permission: Check management
		if (permissions.includes(`${resource}:${action}_Managed`)) {
			const checkOwnership = resolvers[role as UserRoles][resource]?.Managed;
			if (!checkOwnership) {
				return false;
			}
			if (await checkOwnership(requester, resourceId)) {
				return true;
			}
		}

		// Students modifier: Permission to act on behalf of students
		if (permissions.includes(`${resource}:${action}_Students`)) {
			const checkStudentsAccess =
				resolvers[role as UserRoles][resource]?.Students;
			if (!checkStudentsAccess) {
				return false;
			}
			if (await checkStudentsAccess(requester, resourceId)) {
				return true;
			}
		}
	}

	return false;
}

type OwnershipResolver = (
	requester: UserContext,
	resourceId: string
) => Promise<boolean> | boolean;

type Resolvers = Record<
	UserRoles,
	Partial<Record<Resource, Partial<Record<Modifiers, OwnershipResolver>>>>
>;

const resolvers: Resolvers = {
	SysAdmin: {}, // Needs no impl since it's allowed everything
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
			Own: async (requester, resourceId) => {
				try {
					const student = await db.student.findOne({ id: resourceId });
					return (
						student?.shifts.exists((shift) =>
							shift.hospital.manager.exists(
								(manager) => manager.id === requester.hospitalManagerId
							)
						) ?? false
					);
				} catch (error) {
					console.error(
						"Error checking HospitalManager student ownership:",
						error
					);
					return false;
				}
			},
		},
		Shift: {
			Own: async (requester, resourceId) => {
				try {
					const shift = await db.shift.findOne({ id: resourceId });
					return (
						shift?.hospital.manager.exists(
							(manager) => manager.id === requester.hospitalManagerId
						) ?? false
					);
				} catch (error) {
					console.error(
						"Error checking HospitalManager shift ownership:",
						error
					);
					return false;
				}
			},
		},
		Document: { Managed: () => true },
		Classes: { Managed: () => true },
	},
	Preceptor: {
		Student: {
			Own: async (requester, resourceId) => {
				try {
					const student = await db.student.findOne({ id: resourceId });
					return (
						student?.shifts.exists(
							(shift) => shift.preceptor.id === requester.preceptorId
						) ?? false
					);
				} catch (error) {
					console.error("Error checking Preceptor student ownership:", error);
					return false;
				}
			},
		},
		Shift: {
			Own: async (requester, resourceId) => {
				try {
					const shift = await db.shift.findOne({ id: resourceId });
					return shift?.preceptor.id === requester.preceptorId;
				} catch (error) {
					console.error("Error checking Preceptor shift ownership:", error);
					return false;
				}
			},
		},
		Hospital: {
			Own: async (requester, resourceId) => {
				try {
					const hospital = await db.hospital.findOne({ id: resourceId });
					return (
						hospital?.shifts.exists(
							(shift) => shift.preceptor.id === requester.preceptorId
						) ?? false
					);
				} catch (error) {
					console.error("Error checking Preceptor hospital ownership:", error);
					return false;
				}
			},
		},
	},
	Student: {
		Document: {
			Own: async (requester, resourceId) => {
				try {
					const document = await db.document.findOne({ id: resourceId });
					return document?.student.id === requester.studentId;
				} catch (error) {
					console.error("Error checking Student document ownership:", error);
					return false;
				}
			},
		},
		Classes: {
			Own: async (requester, resourceId) => {
				try {
					const student = await db.student.findOne({ id: requester.studentId });
					return student?.class.id === resourceId;
				} catch (error) {
					console.error("Error checking Student class ownership:", error);
					return false;
				}
			},
		},
		Shift: {
			Own: async (requester, resourceId) => {
				try {
					const student = await db.student.findOne({ id: requester.studentId });
					return (
						student?.shifts.exists((shift) => shift.id === resourceId) ?? false
					);
				} catch (error) {
					console.error("Error checking Student shift ownership:", error);
					return false;
				}
			},
		},
		Student: {
			Own: (requester, resourceId) => {
				return requester.studentId === resourceId;
			},
		},
	},
	Supervisor: {
		Student: {
			Own: async (requester, resourceId) => {
				try {
					const student = await db.student.findOne({ id: resourceId });
					return student?.class.course.supervisor.id === requester.supervisorId;
				} catch (error) {
					console.error("Error checking Supervisor student ownership:", error);
					return false;
				}
			},
		},
		Classes: {
			Own: async (requester, resourceId) => {
				try {
					const classEntity = await db.classes.findOne({ id: resourceId });
					return classEntity?.course.supervisor.id === requester.supervisorId;
				} catch (error) {
					console.error("Error checking Supervisor class ownership:", error);
					return false;
				}
			},
		},
		Document: {
			Students: async (requester, resourceId) => {
				try {
					const document = await db.document.findOne({ id: resourceId });
					return (
						document?.student.class.course.supervisor.id ===
						requester.supervisorId
					);
				} catch (error) {
					console.error(
						"Error checking Supervisor document students access:",
						error
					);
					return false;
				}
			},
		},
	},
};
