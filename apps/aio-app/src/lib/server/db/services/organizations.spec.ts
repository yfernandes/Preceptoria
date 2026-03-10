import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "$lib/server/db";
import * as orgService from "./organizations";

// Mock the db module
vi.mock("$lib/server/db", () => ({
	db: {
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn(),
			}),
		}),
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn(),
			}),
		}),
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn(),
				}),
			}),
		}),
		delete: vi.fn().mockReturnValue({
			where: vi.fn().mockReturnValue({
				returning: vi.fn(),
			}),
		}),
	},
}));

describe("Organizations Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create an organization", async () => {
		const mockOrg = { id: "1", name: "Test Org", createdAt: new Date() };
		(db.insert({} as any).values({} as any).returning as any).mockResolvedValue(
			[mockOrg],
		);

		const result = await orgService.createOrganization("Test Org");

		expect(db.insert).toHaveBeenCalled();
		expect(result).toEqual(mockOrg);
	});

	it("should get an organization by id", async () => {
		const mockOrg = { id: "1", name: "Test Org", createdAt: new Date() };
		(db.select().from({} as any).where as any).mockResolvedValue([mockOrg]);

		const result = await orgService.getOrganizationById("1");

		expect(db.select).toHaveBeenCalled();
		expect(result).toEqual(mockOrg);
	});

	it("should update an organization", async () => {
		const mockOrg = { id: "1", name: "Updated Org", createdAt: new Date() };
		(
			db
				.update({} as any)
				.set({} as any)
				.where({} as any).returning as any
		).mockResolvedValue([mockOrg]);

		const result = await orgService.updateOrganization("1", "Updated Org");

		expect(db.update).toHaveBeenCalled();
		expect(result).toEqual(mockOrg);
	});

	it("should delete an organization", async () => {
		const mockOrg = { id: "1", name: "Test Org", createdAt: new Date() };
		(db.delete({} as any).where({} as any).returning as any).mockResolvedValue([
			mockOrg,
		]);

		const result = await orgService.deleteOrganization("1");

		expect(db.delete).toHaveBeenCalled();
		expect(result).toEqual(mockOrg);
	});
});
