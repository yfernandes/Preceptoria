import { Shift } from "@api/modules/shifts/shift.entity";
import { db } from "@api/db";
import { hasPermission } from "@api/utils/hasPermissions";
import { Actions, Resource } from "@api/utils/permissions";
import type { UserContext } from "@api/types/jwtCookie";
import { FilterQuery } from "@mikro-orm/postgresql";

export class ShiftService {
	async createShift(
		requester: UserContext,
		body: {
			date: string;
			startTime: string;
			endTime: string;
			location: string;
			hospitalId: string;
			preceptorId: string;
			studentIds: string[];
		}
	) {
		// Check permissions for creating shifts
		const hasAccess = await hasPermission(
			requester,
			Resource.Shift,
			Actions.Create,
			""
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to create shifts",
			};
		}

		// Validate hospital exists and user has access to it
		const hospital = await db.hospital.findOne({ id: body.hospitalId });
		if (!hospital) {
			return {
				status: 404,
				success: false,
				message: "Hospital not found",
			};
		}

		// Check if user has access to this hospital
		const hasHospitalAccess = await hasPermission(
			requester,
			Resource.Hospital,
			Actions.Read,
			body.hospitalId
		);
		if (!hasHospitalAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to create shifts at this hospital",
			};
		}

		// Validate preceptor exists and user has access to them
		const preceptor = await db.preceptor.findOne({ id: body.preceptorId });
		if (!preceptor) {
			return {
				status: 404,
				success: false,
				message: "Preceptor not found",
			};
		}

		// Check if user has access to this preceptor
		const hasPreceptorAccess = await hasPermission(
			requester,
			Resource.Preceptor,
			Actions.Read,
			body.preceptorId
		);
		if (!hasPreceptorAccess) {
			return {
				status: 403,
				success: false,
				message:
					"You don't have permission to assign this preceptor to the shift",
			};
		}

		// Validate students exist and user has access to them
		const students = [];
		for (const studentId of body.studentIds) {
			const student = await db.student.findOne({ id: studentId });
			if (!student) {
				return {
					status: 404,
					success: false,
					message: `Student with ID ${studentId} not found`,
				};
			}
			// Check if user has access to this student
			const hasStudentAccess = await hasPermission(
				requester,
				Resource.Student,
				Actions.Read,
				studentId
			);
			if (!hasStudentAccess) {
				return {
					status: 403,
					success: false,
					message: `You don't have permission to assign student ${studentId} to the shift`,
				};
			}
			students.push(student);
		}

		// Check for time conflicts
		const shiftDate = new Date(body.date);
		const shiftStartTime = new Date(body.startTime);
		const shiftEndTime = new Date(body.endTime);

		// Check if preceptor has conflicting shifts
		const preceptorConflicts = await db.shift.find({
			preceptor: { id: body.preceptorId },
			date: shiftDate,
			$or: [
				{
					startTime: { $lt: shiftEndTime },
					endTime: { $gt: shiftStartTime },
				},
			],
		});
		if (preceptorConflicts.length > 0) {
			return {
				status: 400,
				success: false,
				message: "Preceptor has conflicting shifts at this time",
			};
		}

		// Check if students have conflicting shifts
		for (const student of students) {
			const studentConflicts = await db.shift.find({
				students: { id: student.id },
				date: shiftDate,
				$or: [
					{
						startTime: { $lt: shiftEndTime },
						endTime: { $gt: shiftStartTime },
					},
				],
			});
			if (studentConflicts.length > 0) {
				return {
					status: 400,
					success: false,
					message: `Student ${student.id} has conflicting shifts at this time`,
				};
			}
		}

		// Create new shift
		const newShift = new Shift(
			shiftDate,
			shiftStartTime,
			shiftEndTime,
			body.location,
			hospital,
			preceptor
		);
		// Add students to the shift
		for (const student of students) {
			newShift.students.add(student);
		}
		await db.em.persistAndFlush(newShift);
		// Return created shift with populated relationships
		const createdShift = await db.shift.findOne(
			{ id: newShift.id },
			{ populate: ["hospital", "preceptor", "students"] }
		);
		return {
			status: 201,
			success: true,
			data: createdShift,
			message: "Shift created successfully",
		};
	}

	async getAllShifts(
		requester: UserContext,
		query: {
			hospitalId?: string;
			preceptorId?: string;
			studentId?: string;
			date?: string;
			limit?: string | number;
			offset?: string | number;
		}
	) {
		const {
			hospitalId,
			preceptorId,
			studentId,
			date,
			limit = 10,
			offset = 0,
		} = query;
		const filter: FilterQuery<Shift> = {};
		if (hospitalId) filter.hospital = { id: hospitalId };
		if (preceptorId) filter.preceptor = { id: preceptorId };
		if (studentId) filter.students = { id: studentId };
		if (date) filter.date = new Date(date);
		// Get shifts with pagination
		const shifts = await db.shift.find(filter, {
			populate: ["hospital", "preceptor", "students"],
			limit: parseInt(limit as string),
			offset: parseInt(offset as string),
			orderBy: { date: "DESC", startTime: "ASC" },
		});
		// Filter shifts based on permissions
		const accessibleShifts = [];
		for (const shift of shifts) {
			const hasAccess = await hasPermission(
				requester,
				Resource.Shift,
				Actions.Read,
				shift.id
			);
			if (hasAccess) accessibleShifts.push(shift);
		}
		return {
			status: 200,
			success: true,
			data: accessibleShifts,
			pagination: {
				total: accessibleShifts.length,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				hasMore: accessibleShifts.length === parseInt(limit as string),
			},
		};
	}

	async getShiftById(requester: UserContext, id: string) {
		// Check permissions for reading this specific shift
		const hasAccess = await hasPermission(
			requester,
			Resource.Shift,
			Actions.Read,
			id
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to view this shift",
			};
		}
		// Find shift by ID with populated relationships
		const shift = await db.shift.findOne(
			{ id },
			{
				populate: [
					"hospital",
					"preceptor",
					"students",
					"students.class",
					"students.class.course",
				],
			}
		);
		if (!shift) {
			return {
				status: 404,
				success: false,
				message: "Shift not found",
			};
		}
		return {
			status: 200,
			success: true,
			data: shift,
		};
	}

	async updateShift(
		requester: UserContext,
		id: string,
		body: {
			date?: string;
			startTime?: string;
			endTime?: string;
			location?: string;
			hospitalId?: string;
			preceptorId?: string;
			studentIds?: string[];
		}
	) {
		// Check permissions for updating this shift
		const hasAccess = await hasPermission(
			requester,
			Resource.Shift,
			Actions.Update,
			id
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to update this shift",
			};
		}
		// Find shift by ID
		const shift = await db.shift.findOne({ id });
		if (!shift) {
			return {
				status: 404,
				success: false,
				message: "Shift not found",
			};
		}
		// Validate hospital exists if hospitalId is being updated
		if (body.hospitalId) {
			const hospital = await db.hospital.findOne({ id: body.hospitalId });
			if (!hospital) {
				return {
					status: 404,
					success: false,
					message: "Hospital not found",
				};
			}
			// Check if user has access to this hospital
			const hasHospitalAccess = await hasPermission(
				requester,
				Resource.Hospital,
				Actions.Read,
				body.hospitalId
			);
			if (!hasHospitalAccess) {
				return {
					status: 403,
					success: false,
					message:
						"You don't have permission to assign this shift to the specified hospital",
				};
			}
			shift.hospital = hospital;
		}
		// Validate preceptor exists if preceptorId is being updated
		if (body.preceptorId) {
			const preceptor = await db.preceptor.findOne({ id: body.preceptorId });
			if (!preceptor) {
				return {
					status: 404,
					success: false,
					message: "Preceptor not found",
				};
			}
			// Check if user has access to this preceptor
			const hasPreceptorAccess = await hasPermission(
				requester,
				Resource.Preceptor,
				Actions.Read,
				body.preceptorId
			);
			if (!hasPreceptorAccess) {
				return {
					status: 403,
					success: false,
					message:
						"You don't have permission to assign this preceptor to the shift",
				};
			}
			shift.preceptor = preceptor;
		}
		// Update students if studentIds is being updated
		if (body.studentIds) {
			// Clear existing students
			shift.students.removeAll();
			// Add new students
			for (const studentId of body.studentIds) {
				const student = await db.student.findOne({ id: studentId });
				if (!student) {
					return {
						status: 404,
						success: false,
						message: `Student with ID ${studentId} not found`,
					};
				}
				// Check if user has access to this student
				const hasStudentAccess = await hasPermission(
					requester,
					Resource.Student,
					Actions.Read,
					studentId
				);
				if (!hasStudentAccess) {
					return {
						status: 403,
						success: false,
						message: `You don't have permission to assign student ${studentId} to the shift`,
					};
				}
				shift.students.add(student);
			}
		}
		// Update shift properties
		if (body.date) {
			shift.date = new Date(body.date);
		}
		if (body.startTime) {
			shift.startTime = new Date(body.startTime);
		}
		if (body.endTime) {
			shift.endTime = new Date(body.endTime);
		}
		if (body.location) {
			shift.location = body.location;
		}
		await db.em.persistAndFlush(shift);
		// Return updated shift with populated relationships
		const updatedShift = await db.shift.findOne(
			{ id },
			{ populate: ["hospital", "preceptor", "students"] }
		);
		return {
			status: 200,
			success: true,
			data: updatedShift,
			message: "Shift updated successfully",
		};
	}

	async deleteShift(requester: UserContext, id: string) {
		// Check permissions for deleting this shift
		const hasAccess = await hasPermission(
			requester,
			Resource.Shift,
			Actions.Delete,
			id
		);
		if (!hasAccess) {
			return {
				status: 403,
				success: false,
				message: "You don't have permission to delete this shift",
			};
		}
		// Find shift by ID
		const shift = await db.shift.findOne({ id });
		if (!shift) {
			return {
				status: 404,
				success: false,
				message: "Shift not found",
			};
		}
		// Delete shift
		await db.em.removeAndFlush(shift);
		return {
			status: 200,
			success: true,
			message: "Shift deleted successfully",
		};
	}
}
