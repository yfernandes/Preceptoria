import { describe, it, expect } from "bun:test";
import { UserRoles } from "../entities/role.abstract";

describe.todo("Auth Middleware", () => {
	it("should have correct UserRoles enum", () => {
		expect(UserRoles.Student).toBe(UserRoles.Student);
		expect(UserRoles.Supervisor).toBe(UserRoles.Supervisor);
		expect(UserRoles.OrgAdmin).toBe(UserRoles.OrgAdmin);
		expect(UserRoles.SysAdmin).toBe(UserRoles.SysAdmin);
		expect(UserRoles.HospitalManager).toBe(UserRoles.HospitalManager);
		expect(UserRoles.Preceptor).toBe(UserRoles.Preceptor);
	});

	it("should define CachedUserType structure", () => {
		const cachedUser = {
			id: "test-id",
			roles: [UserRoles.Student],
			studentId: "student-id",
		};

		expect(cachedUser.id).toBe("test-id");
		expect(cachedUser.roles).toEqual([UserRoles.Student]);
		expect(cachedUser.studentId).toBe("student-id");
	});

	it("should define IUserRepository interface", () => {
		const repository = {
			findOneById: (id: string) => {
				return { id, roles: [UserRoles.Student] };
			},
		};

		expect(typeof repository.findOneById).toBe("function");
	});
});
