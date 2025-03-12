import Elysia, { t } from "elysia";
import { OrgAdmin } from "../entities";
import { db } from "../db";

const createOrgAdminDto = {
	body: t.Object({
		userId: t.String(),
		organization: t.Union([
			t.Object({
				organizationType: t.Literal("hospital"),
				organizationId: t.String(),
			}),
			t.Object({
				organizationType: t.Literal("school"),
				organizationId: t.String(),
			}),
		]),
	}),
};

export const orgAdminController = new Elysia({ prefix: "orgAdmin" })
	.post(
		"/",
		async ({ body: { userId, organization } }) => {
			const user = await db.user.findOne({ id: userId });
			if (!user) {
				return new Error("User not Found");
			}
			const admin = new OrgAdmin(user);
			if (organization.organizationType === "hospital") {
				const hospital = await db.hospital.findOne({
					id: organization.organizationId,
				});
				if (!hospital) {
					return new Error("Hospital could not be found");
				}
				admin.hospital = hospital;
				return admin;
			}
			const school = await db.school.findOne({
				id: organization.organizationId,
			});
			if (!school) {
				return new Error("School could not be found");
			}
			admin.school = school;
			return admin;
		},
		createOrgAdminDto
	)
	.get("/", "Get All")
	.get("/:id", "Get One")
	.patch("/:id", "Update One")
	.delete("/:id", "Delete One");
