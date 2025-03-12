import { db } from "../db";
import { UserRoles } from "../entities/role.abstract";
import { CachedUserType } from "../middlewares/auth";
import { Actions, Modifiers, Resource, rolesPermissions } from "./permissions";

export async function hasPermission(
	requester: CachedUserType,
	resource: Resource,
	action: Actions,
	resourceId: string
): Promise<boolean> {
	for (const role of requester.roles) {
		const permissions = rolesPermissions[role];

		// Full access
		if (permissions.includes("*:*:*")) return true;

		// Own Resources
		if (permissions.includes(`${resource}:${action}_Own`)) {
			// Assuming Managed follows the same ownership pattern
			const checkOwnership = resolvers[role][resource]?.Managed;
			if (!checkOwnership) {
				return false;
			}
			if (await checkOwnership(requester, resourceId)) {
				return true;
			}
		}

		// Scoped permission: Check management
		if (permissions.includes(`${resource}:${action}_Managed`)) {
			// Assuming Managed follows the same ownership pattern
			const checkOwnership = resolvers[role][resource]?.Managed;
			if (!checkOwnership) {
				return false;
			}
			if (await checkOwnership(requester, resourceId)) {
				return true;
			}
		}
	}

	return false;
}

type OwnershipResolver = (
	requester: CachedUserType,
	resourceId: string
) => Promise<boolean> | boolean;

type Resolvers = Record<
	UserRoles,
	Partial<Record<Resource, Partial<Record<Modifiers, OwnershipResolver>>>>
>;

const resolvers: Resolvers = {
	SysAdmin: {}, // Needs no impl since it's allowed everything
	OrgAdmin: { Document: { Managed: () => true } },
	HospitalManager: {},
	Preceptor: {},
	Student: {
		Document: {
			Own: async (requester, resourceId) =>
				(await db.document.findOne({ id: resourceId }))?.student.id ==
				requester.studentId,
		},
		Classes: {
			Own: async (requester, resourceId) => {
				const student = await db.student.findOne({ id: requester.studentId });
				return student?.class.id == resourceId;
			},
		},
		Shift: {},
	},
	Supervisor: {},
};
