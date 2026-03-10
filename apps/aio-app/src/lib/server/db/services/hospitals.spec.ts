import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "$lib/server/db";
import * as hospitalService from "./hospitals";

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

describe("Hospitals Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a hospital", async () => {
		const mockHospital = {
			id: "1",
			name: "Test Hospital",
			address: "Test St",
			organizationId: "org1",
		};
		(db.insert({} as any).values({} as any).returning as any).mockResolvedValue(
			[mockHospital],
		);

		const result = await hospitalService.createHospital({
			name: "Test Hospital",
			address: "Test St",
			organizationId: "org1",
		});

		expect(db.insert).toHaveBeenCalled();
		expect(result).toEqual(mockHospital);
	});

	it("should list hospitals", async () => {
		const mockHospitals = [{ id: "1", name: "Test Hospital" }];
		(db.select().from({} as any).where as any).mockResolvedValue(mockHospitals);
		// Fallback for list without where
		(db.select().from({} as any) as any).mockResolvedValue(mockHospitals);

		const result = await hospitalService.listHospitals();

		expect(db.select).toHaveBeenCalled();
		expect(result).toEqual(mockHospitals);
	});
});
