import { eq } from "drizzle-orm";
import { db } from "../index";
import { preceptors, shifts, user } from "../schema";

export class PreceptorsService {
	static async create(data: {
		userId: string;
		hospitalId: string;
		specialty?: string | null;
		licenseNumber?: string | null;
	}) {
		// Check if user is already a preceptor
		const existing = await db.query.preceptors.findFirst({
			where: eq(preceptors.userId, data.userId),
		});

		if (existing) {
			throw new Error("User is already a preceptor");
		}

		const [newPreceptor] = await db
			.insert(preceptors)
			.values({
				userId: data.userId,
				hospitalId: data.hospitalId,
				specialty: data.specialty,
				licenseNumber: data.licenseNumber,
			})
			.returning();

		// Ensure user role is updated if it was a default/student role
		const u = await db.query.user.findFirst({
			where: eq(user.id, data.userId),
		});
		if (u && ["Student", "SysAdmin", "OrgAdmin"].indexOf(u.role) === -1) {
			await db
				.update(user)
				.set({ role: "Preceptor" })
				.where(eq(user.id, data.userId));
		}

		return newPreceptor;
	}

	static async findAll(query?: {
		hospitalId?: string;
		specialty?: string;
		limit?: number;
		offset?: number;
	}) {
		return await db.query.preceptors.findMany({
			where: (p, { eq, ilike, and }) => {
				const conditions = [];
				if (query?.hospitalId)
					conditions.push(eq(p.hospitalId, query.hospitalId));
				if (query?.specialty)
					conditions.push(ilike(p.specialty, `%${query.specialty}%`));
				return and(...conditions);
			},
			with: {
				user: true,
				hospital: true,
			},
			limit: query?.limit,
			offset: query?.offset,
			orderBy: (p, { desc }) => [desc(p.createdAt)],
		});
	}

	static async findById(id: string) {
		return await db.query.preceptors.findFirst({
			where: eq(preceptors.id, id),
			with: {
				user: true,
				hospital: true,
				shifts: true,
			},
		});
	}

	static async update(
		id: string,
		data: { hospitalId?: string; specialty?: string; licenseNumber?: string },
	) {
		const [updated] = await db
			.update(preceptors)
			.set({
				...(data.hospitalId && { hospitalId: data.hospitalId }),
				...(data.specialty !== undefined && { specialty: data.specialty }),
				...(data.licenseNumber !== undefined && {
					licenseNumber: data.licenseNumber,
				}),
			})
			.where(eq(preceptors.id, id))
			.returning();

		if (!updated) throw new Error("Preceptor not found");
		return updated;
	}

	static async delete(id: string) {
		// Verify there are no active shifts for this preceptor to mirror legacy logic
		const preceptorShifts = await db.query.shifts.findMany({
			where: eq(shifts.preceptorId, id),
		});

		if (preceptorShifts.length > 0) {
			throw new Error(
				"Cannot delete preceptor while they have active shifts. Please reassign or complete shifts first.",
			);
		}

		const [deleted] = await db
			.delete(preceptors)
			.where(eq(preceptors.id, id))
			.returning();
		if (!deleted) throw new Error("Preceptor not found");
		return deleted;
	}
}
