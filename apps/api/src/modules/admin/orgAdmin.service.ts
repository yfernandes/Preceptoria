import { db } from "@api/db";
import { OrgAdmin } from "@api/modules/admin/OrgAdmin.entity";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import { UserContext } from "@api/types/jwtCookie";
import { FilterQuery } from "@mikro-orm/postgresql";

export class OrgAdminService {
	async createOrgAdmin(
		requester: UserContext,
		userId: string,
		hospitalId?: string,
		schoolId?: string
	) {
		const hasAccess = await hasPermission(
			requester,
			Resource.OrgAdmin,
			Actions.Create,
			""
		);
		if (!hasAccess)
			return {
				status: 403,
				error: "You don't have permission to create org admins",
			};

		const user = await db.user.findOne({ id: userId });
		if (!user) return { status: 404, error: "User not found" };

		const existingOrgAdmin = await db.orgAdmin.findOne({
			user: { id: userId },
		});
		if (existingOrgAdmin)
			return { status: 400, error: "User is already an org admin" };

		let hospital = null;
		let school = null;
		if (hospitalId) {
			hospital = await db.hospital.findOne({ id: hospitalId });
			if (!hospital) return { status: 404, error: "Hospital not found" };
		}
		if (schoolId) {
			school = await db.school.findOne({ id: schoolId });
			if (!school) return { status: 404, error: "School not found" };
		}
		if (!hospitalId && !schoolId)
			return {
				status: 400,
				error: "Either hospitalId or schoolId must be provided",
			};

		const newOrgAdmin = new OrgAdmin(user);
		if (hospital) newOrgAdmin.hospital = hospital;
		if (school) newOrgAdmin.school = school;
		await db.em.persistAndFlush(newOrgAdmin);
		const createdOrgAdmin = await db.orgAdmin.findOne(
			{ id: newOrgAdmin.id },
			{ populate: ["user", "hospital", "school"] }
		);
		return { status: 201, orgAdmin: createdOrgAdmin };
	}

	async getOrgAdmins(
		requester: UserContext,
		query: {
			hospitalId?: string;
			schoolId?: string;
			limit?: string | number;
			offset?: string | number;
		}
	) {
		const { hospitalId, schoolId, limit = 10, offset = 0 } = query;
		const filter: FilterQuery<OrgAdmin> = {};
		if (hospitalId) filter.hospital = { id: hospitalId };
		if (schoolId) filter.school = { id: schoolId };
		const orgAdmins = await db.orgAdmin.find(filter, {
			populate: ["user", "hospital", "school"],
			limit: typeof limit === "string" ? parseInt(limit) : limit,
			offset: typeof offset === "string" ? parseInt(offset) : offset,
			orderBy: { createdAt: "DESC" },
		});
		const accessibleOrgAdmins = [];
		for (const orgAdmin of orgAdmins) {
			const hasAccess = await hasPermission(
				requester,
				Resource.OrgAdmin,
				Actions.Read,
				orgAdmin.id
			);
			if (hasAccess) accessibleOrgAdmins.push(orgAdmin);
		}
		return {
			data: accessibleOrgAdmins,
			pagination: {
				total: accessibleOrgAdmins.length,
				limit: typeof limit === "string" ? parseInt(limit) : limit,
				offset: typeof offset === "string" ? parseInt(offset) : offset,
				hasMore:
					accessibleOrgAdmins.length ===
					(typeof limit === "string" ? parseInt(limit) : limit),
			},
		};
	}

	async getOrgAdminById(requester: UserContext, id: string) {
		const hasAccess = await hasPermission(
			requester,
			Resource.OrgAdmin,
			Actions.Read,
			id
		);
		if (!hasAccess)
			return {
				status: 403,
				error: "You don't have permission to view this org admin",
			};
		const orgAdmin = await db.orgAdmin.findOne(
			{ id },
			{ populate: ["user", "hospital", "school"] }
		);
		if (!orgAdmin) return { status: 404, error: "Org admin not found" };
		return { orgAdmin };
	}

	async updateOrgAdmin(
		requester: UserContext,
		id: string,
		body: { hospitalId?: string; schoolId?: string }
	) {
		const hasAccess = await hasPermission(
			requester,
			Resource.OrgAdmin,
			Actions.Update,
			id
		);
		if (!hasAccess)
			return {
				status: 403,
				error: "You don't have permission to update this org admin",
			};
		const orgAdmin = await db.orgAdmin.findOne({ id });
		if (!orgAdmin) return { status: 404, error: "Org admin not found" };
		if (body.hospitalId) {
			const hospital = await db.hospital.findOne({ id: body.hospitalId });
			if (!hospital) return { status: 404, error: "Hospital not found" };
			orgAdmin.hospital = hospital;
		}
		if (body.schoolId) {
			const school = await db.school.findOne({ id: body.schoolId });
			if (!school) return { status: 404, error: "School not found" };
			orgAdmin.school = school;
		}
		await db.em.persistAndFlush(orgAdmin);
		const updatedOrgAdmin = await db.orgAdmin.findOne(
			{ id },
			{ populate: ["user", "hospital", "school"] }
		);
		return { orgAdmin: updatedOrgAdmin };
	}

	async deleteOrgAdmin(requester: UserContext, id: string) {
		const hasAccess = await hasPermission(
			requester,
			Resource.OrgAdmin,
			Actions.Delete,
			id
		);
		if (!hasAccess)
			return {
				status: 403,
				error: "You don't have permission to delete this org admin",
			};
		const orgAdmin = await db.orgAdmin.findOne({ id });
		if (!orgAdmin) return { status: 404, error: "Org admin not found" };
		if (orgAdmin.hospital) {
			const hospitalOrgAdmins = await db.orgAdmin.count({
				hospital: { id: orgAdmin.hospital.id },
			});
			if (hospitalOrgAdmins <= 1)
				return {
					status: 400,
					error: "Cannot delete the last org admin for this hospital",
				};
		}
		if (orgAdmin.school) {
			const schoolOrgAdmins = await db.orgAdmin.count({
				school: { id: orgAdmin.school.id },
			});
			if (schoolOrgAdmins <= 1)
				return {
					status: 400,
					error: "Cannot delete the last org admin for this school",
				};
		}
		await db.em.removeAndFlush(orgAdmin);
		return { deleted: true };
	}
}
