import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
    primaryKey,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
	"SysAdmin",
	"OrgAdmin",
	"Supervisor",
	"HospitalManager",
	"Preceptor",
	"Student",
]);

export const documentTypeEnum = pgEnum("document_type", [
	"PROFESSIONAL_ID",
	"VACCINATION_CARD",
	"COMMITMENT_CONTRACT",
	"ADMISSION_FORM",
	"BADGE_PICTURE",
	"INSURANCE_DOCUMENTATION",
	"OTHER",
]);

export const documentStatusEnum = pgEnum("document_status", [
	"PENDING",
	"APPROVED",
	"REJECTED",
	"EXPIRED",
]);

// Better Auth Tables
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	role: userRoleEnum("role").default("Student").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt"),
});

// Business Logic Tables
export const organizations = pgTable("organization", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hospitals = pgTable("hospital", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	address: text("address"),
	organizationId: uuid("organization_id").references(() => organizations.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schools = pgTable("school", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	organizationId: uuid("organization_id").references(() => organizations.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("course", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	schoolId: uuid("school_id")
		.notNull()
		.references(() => schools.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classes = pgTable("class", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	courseId: uuid("course_id")
		.notNull()
		.references(() => courses.id),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("student", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	classId: uuid("class_id")
		.notNull()
		.references(() => classes.id),
	registrationNumber: text("registration_number"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supervisors = pgTable("supervisor", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	schoolId: uuid("school_id")
		.notNull()
		.references(() => schools.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hospitalManagers = pgTable("hospital_manager", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	hospitalId: uuid("hospital_id")
		.notNull()
		.references(() => hospitals.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preceptors = pgTable("preceptor", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	hospitalId: uuid("hospital_id")
		.notNull()
		.references(() => hospitals.id),
	specialty: text("specialty"),
	licenseNumber: text("license_number"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shifts = pgTable("shift", {
	id: uuid("id").defaultRandom().primaryKey(),
	hospitalId: uuid("hospital_id")
		.notNull()
		.references(() => hospitals.id),
	preceptorId: uuid("preceptor_id")
		.notNull()
		.references(() => preceptors.id),
	date: timestamp("date").notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),
	location: text("location"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentShifts = pgTable("student_shift", {
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	shiftId: uuid("shift_id")
		.notNull()
		.references(() => shifts.id),
}, (t) => ({
	pk: primaryKey({ columns: [t.studentId, t.shiftId] }),
}));

export const documents = pgTable("document", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	name: text("name").notNull(),
	type: documentTypeEnum("type").notNull(),
	status: documentStatusEnum("status").default("PENDING").notNull(),
	url: text("url").notNull(), // Cloudflare R2 URL
	mimeType: text("mime_type"),
	fileSize: integer("file_size"),
	expiresAt: timestamp("expires_at"),
	rejectionReason: text("rejection_reason"),
	verifiedBy: text("verified_by").references(() => user.id),
	verifiedAt: timestamp("verified_at"),
	validationChecks: jsonb("validation_checks"), // e.g., { "hasVaccineA": true }
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const internshipPlacements = pgTable("internship_placement", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	hospitalId: uuid("hospital_id")
		.notNull()
		.references(() => hospitals.id),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date").notNull(),
	status: text("status").default("ACTIVE").notNull(), // ACTIVE, COMPLETED, CANCELLED
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
