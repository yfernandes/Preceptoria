import { beforeEach, describe, expect, it, type Mock, vi } from "vitest"
import { db } from "$lib/server/db"
import * as hospitalService from "./hospitals"

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
}))

describe("Hospitals Service", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should create a hospital", async () => {
		const mockHospital = {
			id: "1",
			name: "Test Hospital",
			address: "Test St",
			organizationId: "org1",
		}
		;(db.insert as unknown as Mock).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([mockHospital]),
			}),
		})

		const result = await hospitalService.createHospital({
			name: "Test Hospital",
			address: "Test St",
			organizationId: "org1",
		})

		expect(db.insert).toHaveBeenCalled()
		expect(result).toEqual(mockHospital)
	})

	it("should list hospitals", async () => {
		const mockHospitals = [{ id: "1", name: "Test Hospital" }]
		const mockSelect = {
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockResolvedValue(mockHospitals),
		}
		// Reset select mock for this test to return our controlled chain
		;(db.select as unknown as Mock).mockReturnValue(mockSelect)
		delete (mockSelect as unknown as { then?: unknown }).then

		// For the simple list case (no where)
		const mockSelectSimple = {
			from: vi.fn().mockResolvedValue(mockHospitals),
		}
		;(db.select as unknown as Mock).mockReturnValue(mockSelectSimple)

		const result = await hospitalService.listHospitals()

		expect(db.select).toHaveBeenCalled()
		expect(result).toEqual(mockHospitals)
	})
})
