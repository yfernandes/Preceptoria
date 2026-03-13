import { beforeEach, describe, expect, it, vi } from "vitest"
import { PreceptorsService } from "./preceptors"

vi.mock("../index", () => {
	return {
		db: {
			query: {
				preceptors: {
					findFirst: vi.fn(),
					findMany: vi.fn(),
				},
				user: {
					findFirst: vi.fn(),
				},
				shifts: {
					findMany: vi.fn(),
				},
			},
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	}
})

describe("PreceptorsService", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should exist", () => {
		expect(PreceptorsService).toBeDefined()
	})
})
