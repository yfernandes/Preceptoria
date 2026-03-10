import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../index";
import { ShiftsService } from "./shifts";

vi.mock("../index", () => {
	return {
		db: {
			query: {
				shifts: {
					findFirst: vi.fn(),
					findMany: vi.fn(),
				},
			},
			transaction: vi.fn(),
		},
	};
});

describe("ShiftsService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should exist", () => {
		expect(ShiftsService).toBeDefined();
	});
});
