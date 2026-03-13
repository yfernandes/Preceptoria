import { describe, it, expect, vi, beforeEach } from "vitest";
import * as hospitalService from "$lib/server/db/services/hospitals";
import * as orgService from "$lib/server/db/services/organizations";

// Mock the db module to prevent neon() initialization error
vi.mock("$lib/server/db", () => ({
	db: {},
}));

import { load, actions } from "./+page.server";

vi.mock("$lib/server/db/services/hospitals");
vi.mock("$lib/server/db/services/organizations");

describe("Hospitals Page Server", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should load hospitals and organizations", async () => {
		const mockHospitals = [{ id: "1", name: "Hosp 1" }];
		const mockOrgs = [{ id: "1", name: "Org 1" }];

		(hospitalService.listHospitals as any).mockResolvedValue(mockHospitals);
		(orgService.listOrganizations as any).mockResolvedValue(mockOrgs);

		const result = await load({ locals: { user: { id: "1", role: "SysAdmin" } } } as any);

		expect(result).toEqual({
			hospitals: mockHospitals,
			organizations: mockOrgs,
		});
	});

	it("should create a hospital via action", async () => {
		const formData = new FormData();
		formData.append("name", "New Hospital");
		formData.append("address", "123 St");

		const request = {
			formData: () => Promise.resolve(formData),
		};

		await (actions.create as any)({ request, locals: { user: { id: "1" } } });

		expect(hospitalService.createHospital).toHaveBeenCalledWith({
			name: "New Hospital",
			address: "123 St",
			organizationId: undefined,
		});
	});
});
