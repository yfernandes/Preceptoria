import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasPermission, Resource, Actions } from './permissions';
import { db } from '$lib/server/db';

// Mock DB
vi.mock('$lib/server/db', () => ({
	db: {
		query: {
			supervisors: { findFirst: vi.fn() },
			students: { findFirst: vi.fn() },
			documents: { findFirst: vi.fn() },
			classes: { findFirst: vi.fn() }
		}
	}
}));

describe('Permissions System', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should allow SysAdmin to do anything', async () => {
		const user = { role: 'SysAdmin' };
		const result = await hasPermission(user, Resource.Student, Actions.Delete, 'any-id');
		expect(result).toBe(true);
	});

	describe('Supervisor Permissions', () => {
		const supervisorUser = { id: 'user-1', role: 'Supervisor' };
		const mockSupProfile = { id: 'sup-1', userId: 'user-1' };

		it('should allow supervisor to read student in their class', async () => {
			(db.query.supervisors.findFirst as any).mockResolvedValue(mockSupProfile);
			(db.query.students.findFirst as any).mockResolvedValue({
				id: 'student-1',
				class: { supervisorId: 'sup-1' }
			});

			const result = await hasPermission(supervisorUser, Resource.Student, Actions.Read, 'student-1');
			expect(result).toBe(true);
		});

		it('should deny supervisor to read student in another class', async () => {
			(db.query.supervisors.findFirst as any).mockResolvedValue(mockSupProfile);
			(db.query.students.findFirst as any).mockResolvedValue({
				id: 'student-2',
				class: { supervisorId: 'other-sup' }
			});

			const result = await hasPermission(supervisorUser, Resource.Student, Actions.Read, 'student-2');
			expect(result).toBe(false);
		});
	});

	describe('Student Permissions', () => {
		const studentUser = { id: 'user-student', role: 'Student' };
		const mockStudentProfile = { id: 'student-1', userId: 'user-student', class: { status: 'ACTIVE' } };

		it('should allow student to read their own document', async () => {
			(db.query.students.findFirst as any).mockResolvedValue(mockStudentProfile);
			(db.query.documents.findFirst as any).mockResolvedValue({
				id: 'doc-1',
				studentId: 'student-1'
			});

			const result = await hasPermission(studentUser, Resource.Document, Actions.Read, 'doc-1');
			expect(result).toBe(true);
		});

		it('should deny student to modify documents if class is COMPLETED', async () => {
			(db.query.students.findFirst as any).mockResolvedValue({
				...mockStudentProfile,
				class: { status: 'COMPLETED' }
			});
			(db.query.documents.findFirst as any).mockResolvedValue({
				id: 'doc-1',
				studentId: 'student-1'
			});

			const result = await hasPermission(studentUser, Resource.Document, Actions.Update, 'doc-1');
			expect(result).toBe(false);
		});
	});
});
