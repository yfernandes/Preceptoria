import { describe, it, expect } from "bun:test";
import { BaseEntity } from "./baseEntity";

describe("BaseEntity", () => {
	describe("ID Generation", () => {
		it("should generate a unique UUID v7 for each instance", () => {
			const entity1 = new BaseEntity();
			const entity2 = new BaseEntity();

			expect(entity1.id).toBeDefined();
			expect(entity2.id).toBeDefined();
			expect(entity1.id).not.toBe(entity2.id);
			expect(typeof entity1.id).toBe("string");
			expect(entity1.id.length).toBeGreaterThan(0);
		});
	});

	describe("Timestamps", () => {
		it("should set createdAt timestamp on creation", () => {
			const beforeCreation = new Date();
			const entity = new BaseEntity();
			const afterCreation = new Date();

			expect(entity.createdAt).toBeInstanceOf(Date);
			expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(
				beforeCreation.getTime()
			);
			expect(entity.createdAt.getTime()).toBeLessThanOrEqual(
				afterCreation.getTime()
			);
		});

		it("should set updatedAt timestamp on creation", () => {
			const beforeCreation = new Date();
			const entity = new BaseEntity();
			const afterCreation = new Date();

			expect(entity.updatedAt).toBeInstanceOf(Date);
			expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(
				beforeCreation.getTime()
			);
			expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(
				afterCreation.getTime()
			);
		});

		it("should have createdAt and updatedAt initially equal", () => {
			const entity = new BaseEntity();
			expect(entity.createdAt.getTime()).toBe(entity.updatedAt.getTime());
		});
	});

	describe("Inheritance", () => {
		it("should be properly instantiable", () => {
			const entity = new BaseEntity();
			expect(entity).toBeInstanceOf(BaseEntity);
		});
	});
});
