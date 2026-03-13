import { and, eq, gt, lt, or } from "drizzle-orm";
import { db } from "../index";
import { shifts, studentShifts } from "../schema";

export class ShiftsService {
	static async create(data: {
		date: Date;
		startTime: Date;
		endTime: Date;
		location?: string | null;
		hospitalId: string;
		preceptorId: string;
		studentIds: string[];
	}) {
		const shiftDate = new Date(data.date);
		const shiftStartTime = new Date(data.startTime);
		const shiftEndTime = new Date(data.endTime);

		// Check for time conflicts for the preceptor
		const preceptorConflicts = await db.query.shifts.findMany({
			where: and(
				eq(shifts.preceptorId, data.preceptorId),
				eq(shifts.date, shiftDate),
				or(and(lt(shifts.startTime, shiftEndTime), gt(shifts.endTime, shiftStartTime)))
			),
		});

		if (preceptorConflicts.length > 0) {
			throw new Error("Preceptor has conflicting shifts at this time");
		}

		// Check for time conflicts for the students
		for (const studentId of data.studentIds) {
			const studentConflicts = await db.query.shifts.findMany({
				where: and(
					eq(shifts.date, shiftDate),
					or(and(lt(shifts.startTime, shiftEndTime), gt(shifts.endTime, shiftStartTime)))
				),
				with: {
					students: {
						where: eq(studentShifts.studentId, studentId),
					},
				},
			});

			const hasConflict = studentConflicts.some((s) => s.students.length > 0);
			if (hasConflict) {
				throw new Error(`Student ${studentId} has conflicting shifts at this time`);
			}
		}

		// Start a transaction since we need to insert the shift and student-shift relationships
		return await db.transaction(async (tx) => {
			const [newShift] = await tx
				.insert(shifts)
				.values({
					date: shiftDate,
					startTime: shiftStartTime,
					endTime: shiftEndTime,
					location: data.location,
					hospitalId: data.hospitalId,
					preceptorId: data.preceptorId,
				})
				.returning();

			if (data.studentIds.length > 0) {
				const studentShiftEntries = data.studentIds.map((studentId) => ({
					shiftId: newShift.id,
					studentId: studentId,
				}));

				await tx.insert(studentShifts).values(studentShiftEntries);
			}

			return newShift;
		});
	}

	static async findAll(query?: {
		hospitalId?: string;
		preceptorId?: string;
		studentId?: string;
		date?: Date;
		limit?: number;
		offset?: number;
	}) {
		// Note: Filtering by studentId requires a join in Drizzle
		return await db.query.shifts.findMany({
			where: (s, { eq, and }) => {
				const conditions = [];
				if (query?.hospitalId) conditions.push(eq(s.hospitalId, query.hospitalId));
				if (query?.preceptorId) conditions.push(eq(s.preceptorId, query.preceptorId));
				if (query?.date) conditions.push(eq(s.date, query.date));
				return and(...conditions);
			},
			with: {
				hospital: true,
				preceptor: true,
				students: {
					with: {
						student: true,
					},
				},
			},
			limit: query?.limit,
			offset: query?.offset,
			orderBy: (s, { desc, asc }) => [desc(s.date), asc(s.startTime)],
		});
	}

	static async findById(id: string) {
		return await db.query.shifts.findFirst({
			where: eq(shifts.id, id),
			with: {
				hospital: true,
				preceptor: {
					with: { user: true },
				},
				students: {
					with: {
						student: {
							with: {
								user: true,
								class: {
									with: { course: true },
								},
							},
						},
					},
				},
			},
		});
	}

	static async update(
		id: string,
		data: {
			date?: Date;
			startTime?: Date;
			endTime?: Date;
			location?: string | null;
			hospitalId?: string;
			preceptorId?: string;
			studentIds?: string[];
		}
	) {
		return await db.transaction(async (tx) => {
			const updateData: Record<string, unknown> = {};
			if (data.date) updateData.date = new Date(data.date);
			if (data.startTime) updateData.startTime = new Date(data.startTime);
			if (data.endTime) updateData.endTime = new Date(data.endTime);
			if (data.location !== undefined) updateData.location = data.location;
			if (data.hospitalId) updateData.hospitalId = data.hospitalId;
			if (data.preceptorId) updateData.preceptorId = data.preceptorId;

			let updatedShift: typeof shifts.$inferSelect | undefined;

			if (Object.keys(updateData).length > 0) {
				[updatedShift] = await tx
					.update(shifts)
					.set(updateData)
					.where(eq(shifts.id, id))
					.returning();
			} else {
				updatedShift = await tx.query.shifts.findFirst({
					where: eq(shifts.id, id),
				});
			}

			if (!updatedShift) throw new Error("Shift not found");

			// If updating students, replace all connections
			if (data.studentIds) {
				await tx.delete(studentShifts).where(eq(studentShifts.shiftId, id));

				if (data.studentIds.length > 0) {
					const newEntries = data.studentIds.map((studentId) => ({
						shiftId: id,
						studentId,
					}));
					await tx.insert(studentShifts).values(newEntries);
				}
			}

			return updatedShift;
		});
	}

	static async delete(id: string) {
		return await db.transaction(async (tx) => {
			// First delete associations
			await tx.delete(studentShifts).where(eq(studentShifts.shiftId, id));

			// Then delete shift
			const [deleted] = await tx.delete(shifts).where(eq(shifts.id, id)).returning();
			if (!deleted) throw new Error("Shift not found");

			return deleted;
		});
	}
}
