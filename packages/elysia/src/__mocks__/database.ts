import { mock } from "bun:test";
import { UserRoles } from "../entities/role.abstract";

// Mock data types
export interface MockUser {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	passwordHash: string;
	roles: UserRoles[];
	sysAdmin?: { id: string } | null;
	orgAdmin?: { id: string } | null;
	supervisor?: { id: string } | null;
	hospitalManager?: { id: string } | null;
	preceptor?: { id: string } | null;
	student?: { id: string } | null;
}

export interface MockDocument {
	id: string;
	name: string;
	url: string;
	student: { id: string };
	uploadedBy: { id: string };
	createdAt: Date;
	updatedAt: Date;
}

export interface MockShift {
	id: string;
	date: Date;
	startTime: string;
	endTime: string;
	hospital: { id: string; name: string };
	preceptor: { id: string; name: string };
	students: { id: string; name: string }[];
}

export interface MockHospital {
	id: string;
	name: string;
	address: string;
	phone: string;
}

export interface MockSchool {
	id: string;
	name: string;
	address: string;
	phone: string;
}

export interface MockCourse {
	id: string;
	name: string;
	description: string;
	school: { id: string };
	supervisor: { id: string };
}

export interface MockClass {
	id: string;
	name: string;
	year: number;
	semester: number;
	course: { id: string };
	students: { id: string }[];
}

// Mock database state
export class MockDatabase {
	private users = new Map<string, MockUser>();
	private documents = new Map<string, MockDocument>();
	private shifts = new Map<string, MockShift>();
	private hospitals = new Map<string, MockHospital>();
	private schools = new Map<string, MockSchool>();
	private courses = new Map<string, MockCourse>();
	private classes = new Map<string, MockClass>();

	// User operations
	async findUserById(id: string): Promise<MockUser | null> {
		return this.users.get(id) || null;
	}

	async findUserByEmail(email: string): Promise<MockUser | null> {
		for (const user of this.users.values()) {
			if (user.email === email) {
				return user;
			}
		}
		return null;
	}

	async createUser(userData: Omit<MockUser, "id">): Promise<MockUser> {
		const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const user: MockUser = { ...userData, id };
		this.users.set(id, user);
		return user;
	}

	async updateUser(
		id: string,
		updates: Partial<MockUser>
	): Promise<MockUser | null> {
		const user = this.users.get(id);
		if (!user) return null;

		const updatedUser = { ...user, ...updates };
		this.users.set(id, updatedUser);
		return updatedUser;
	}

	async deleteUser(id: string): Promise<boolean> {
		return this.users.delete(id);
	}

	// Document operations
	async findDocumentById(id: string): Promise<MockDocument | null> {
		return this.documents.get(id) || null;
	}

	async findDocumentsByStudent(studentId: string): Promise<MockDocument[]> {
		return Array.from(this.documents.values()).filter(
			(doc) => doc.student.id === studentId
		);
	}

	async createDocument(
		documentData: Omit<MockDocument, "id" | "createdAt" | "updatedAt">
	): Promise<MockDocument> {
		const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const now = new Date();
		const document: MockDocument = {
			...documentData,
			id,
			createdAt: now,
			updatedAt: now,
		};
		this.documents.set(id, document);
		return document;
	}

	// Shift operations
	async findShiftById(id: string): Promise<MockShift | null> {
		return this.shifts.get(id) || null;
	}

	async findShiftsByHospital(hospitalId: string): Promise<MockShift[]> {
		return Array.from(this.shifts.values()).filter(
			(shift) => shift.hospital.id === hospitalId
		);
	}

	async findShiftsByPreceptor(preceptorId: string): Promise<MockShift[]> {
		return Array.from(this.shifts.values()).filter(
			(shift) => shift.preceptor.id === preceptorId
		);
	}

	async findShiftsByStudent(studentId: string): Promise<MockShift[]> {
		return Array.from(this.shifts.values()).filter((shift) =>
			shift.students.some((student) => student.id === studentId)
		);
	}

	// Hospital operations
	async findHospitalById(id: string): Promise<MockHospital | null> {
		return this.hospitals.get(id) || null;
	}

	async createHospital(
		hospitalData: Omit<MockHospital, "id">
	): Promise<MockHospital> {
		const id = `hospital-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const hospital: MockHospital = { ...hospitalData, id };
		this.hospitals.set(id, hospital);
		return hospital;
	}

	// School operations
	async findSchoolById(id: string): Promise<MockSchool | null> {
		return this.schools.get(id) || null;
	}

	// Course operations
	async findCourseById(id: string): Promise<MockCourse | null> {
		return this.courses.get(id) || null;
	}

	async findCoursesBySupervisor(supervisorId: string): Promise<MockCourse[]> {
		return Array.from(this.courses.values()).filter(
			(course) => course.supervisor.id === supervisorId
		);
	}

	// Class operations
	async findClassById(id: string): Promise<MockClass | null> {
		return this.classes.get(id) || null;
	}

	async findClassesByCourse(courseId: string): Promise<MockClass[]> {
		return Array.from(this.classes.values()).filter(
			(cls) => cls.course.id === courseId
		);
	}

	// Utility methods
	clear(): void {
		this.users.clear();
		this.documents.clear();
		this.shifts.clear();
		this.hospitals.clear();
		this.schools.clear();
		this.courses.clear();
		this.classes.clear();
	}

	getUserCount(): number {
		return this.users.size;
	}

	getDocumentCount(): number {
		return this.documents.size;
	}

	getShiftCount(): number {
		return this.shifts.size;
	}
}

// Factory functions for creating mock data
export const createMockUser = (
	overrides: Partial<MockUser> = {}
): MockUser => ({
	id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
	name: "Test User",
	email: "test@example.com",
	phoneNumber: "(99) 99999-9999",
	passwordHash: "hashed-password",
	roles: [UserRoles.Student],
	sysAdmin: null,
	orgAdmin: null,
	supervisor: null,
	hospitalManager: null,
	preceptor: null,
	student: { id: `student-${Date.now()}` },
	...overrides,
});

export const createMockDocument = (
	overrides: Partial<MockDocument> = {}
): MockDocument => ({
	id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
	name: "Test Document",
	url: "https://example.com/document.pdf",
	student: { id: "student-1" },
	uploadedBy: { id: "user-1" },
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

export const createMockShift = (
	overrides: Partial<MockShift> = {}
): MockShift => ({
	id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
	date: new Date(),
	startTime: "08:00",
	endTime: "17:00",
	hospital: { id: "hospital-1", name: "Test Hospital" },
	preceptor: { id: "preceptor-1", name: "Test Preceptor" },
	students: [{ id: "student-1", name: "Test Student" }],
	...overrides,
});

// Mock database instance
export const mockDb = new MockDatabase();

// Mock the actual database module
export const createDatabaseMock = () => {
	const mockUserRepository = {
		findOne: mock((query: any) => {
			if (query.email) {
				return Promise.resolve(mockDb.findUserByEmail(query.email));
			}
			if (query.id) {
				return Promise.resolve(mockDb.findUserById(query.id));
			}
			return Promise.resolve(null);
		}),
		create: mock((userData: any) =>
			Promise.resolve(mockDb.createUser(userData))
		),
		update: mock((id: string, updates: any) =>
			Promise.resolve(mockDb.updateUser(id, updates))
		),
		delete: mock((id: string) => Promise.resolve(mockDb.deleteUser(id))),
	};

	const mockDocumentRepository = {
		findOne: mock((query: any) => {
			if (query.id) {
				return Promise.resolve(mockDb.findDocumentById(query.id));
			}
			return Promise.resolve(null);
		}),
		find: mock((query: any) => {
			if (query.student?.id) {
				return Promise.resolve(mockDb.findDocumentsByStudent(query.student.id));
			}
			return Promise.resolve([]);
		}),
		create: mock((documentData: any) =>
			Promise.resolve(mockDb.createDocument(documentData))
		),
	};

	const mockShiftRepository = {
		findOne: mock((query: any) => {
			if (query.id) {
				return Promise.resolve(mockDb.findShiftById(query.id));
			}
			return Promise.resolve(null);
		}),
		find: mock((query: any) => {
			if (query.hospital?.id) {
				return Promise.resolve(mockDb.findShiftsByHospital(query.hospital.id));
			}
			if (query.preceptor?.id) {
				return Promise.resolve(
					mockDb.findShiftsByPreceptor(query.preceptor.id)
				);
			}
			return Promise.resolve([]);
		}),
	};

	const mockHospitalRepository = {
		findOne: mock((query: any) => {
			if (query.id) {
				return Promise.resolve(mockDb.findHospitalById(query.id));
			}
			return Promise.resolve(null);
		}),
		create: mock((hospitalData: any) =>
			Promise.resolve(mockDb.createHospital(hospitalData))
		),
	};

	const mockSchoolRepository = {
		findOne: mock((query: any) => {
			if (query.id) {
				return Promise.resolve(mockDb.findSchoolById(query.id));
			}
			return Promise.resolve(null);
		}),
	};

	const mockCourseRepository = {
		findOne: mock((query: any) => {
			if (query.id) {
				return Promise.resolve(mockDb.findCourseById(query.id));
			}
			return Promise.resolve(null);
		}),
		find: mock((query: any) => {
			if (query.supervisor?.id) {
				return Promise.resolve(
					mockDb.findCoursesBySupervisor(query.supervisor.id)
				);
			}
			return Promise.resolve([]);
		}),
	};

	const mockClassRepository = {
		findOne: mock((query: any) => {
			if (query.id) {
				return Promise.resolve(mockDb.findClassById(query.id));
			}
			return Promise.resolve(null);
		}),
		find: mock((query: any) => {
			if (query.course?.id) {
				return Promise.resolve(mockDb.findClassesByCourse(query.course.id));
			}
			return Promise.resolve([]);
		}),
	};

	return {
		user: mockUserRepository,
		document: mockDocumentRepository,
		shift: mockShiftRepository,
		hospital: mockHospitalRepository,
		school: mockSchoolRepository,
		course: mockCourseRepository,
		classes: mockClassRepository,
		em: {
			persistAndFlush: mock(() => Promise.resolve()),
			persist: mock(() => Promise.resolve()),
			flush: mock(() => Promise.resolve()),
		},
	};
};

// Export the mock database for use in tests
export default createDatabaseMock;
