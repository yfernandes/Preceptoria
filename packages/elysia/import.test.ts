import { describe, it, expect } from "bun:test";
import { UserRoles } from "./src/entities/role.abstract";
describe("Import Test", () => {
	it("can import UserRoles", () => expect(UserRoles.Student).toBe("Student"));
});
