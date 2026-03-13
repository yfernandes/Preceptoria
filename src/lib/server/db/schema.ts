import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
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

export const invitationStatusEnum = pgEnum("invitation_status", ["PENDING", "ACCEPTED", "EXPIRED"]);

export const classStatusEnum = pgEnum("class_status", ["ACTIVE", "COMPLETED"]);

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
	stripeCustomerId: text("stripe_customer_id"),
	subscriptionStatus: text("subscription_status"),
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
	supervisorId: uuid("supervisor_id").references(() => supervisors.id),
	status: classStatusEnum("status").default("ACTIVE").notNull(),
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

export const studentShifts = pgTable(
	"student_shift",
	{
		studentId: uuid("student_id")
			.notNull()
			.references(() => students.id),
		shiftId: uuid("shift_id")
			.notNull()
			.references(() => shifts.id),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.studentId, t.shiftId] }),
	})
);

export const studentAvailability = pgTable("student_availability", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	date: timestamp("date").notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preceptorAvailability = pgTable("preceptor_availability", {
	id: uuid("id").defaultRandom().primaryKey(),
	preceptorId: uuid("preceptor_id")
		.notNull()
		.references(() => preceptors.id),
	date: timestamp("date").notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const invitations = pgTable("invitation", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: text("email").notNull(),
	role: userRoleEnum("role").default("Student").notNull(),
	classId: uuid("class_id").references(() => classes.id),
	hospitalId: uuid("hospital_id").references(() => hospitals.id),
	invitedBy: text("invited_by")
		.notNull()
		.references(() => user.id),
	token: text("token").notNull().unique(),
	status: invitationStatusEnum("status").default("PENDING").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(user, ({ many, one }) => ({
	student: one(students, { fields: [user.id], references: [students.userId] }),
	supervisor: one(supervisors, {
		fields: [user.id],
		references: [supervisors.userId],
	}),
	hospitalManager: one(hospitalManagers, {
		fields: [user.id],
		references: [hospitalManagers.userId],
	}),
	preceptor: one(preceptors, {
		fields: [user.id],
		references: [preceptors.userId],
	}),
	invitationsSent: many(invitations),
}));

export const organizationRelations = relations(organizations, ({ many }) => ({
	hospitals: many(hospitals),
	schools: many(schools),
}));

export const hospitalRelations = relations(hospitals, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [hospitals.organizationId],
		references: [organizations.id],
	}),
	managers: many(hospitalManagers),
	preceptors: many(preceptors),
	shifts: many(shifts),
	placements: many(internshipPlacements),
}));

export const schoolRelations = relations(schools, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [schools.organizationId],
		references: [organizations.id],
	}),
	courses: many(courses),
	supervisors: many(supervisors),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
	school: one(schools, {
		fields: [courses.schoolId],
		references: [schools.id],
	}),
	classes: many(classes),
}));

export const classRelations = relations(classes, ({ one, many }) => ({
	course: one(courses, {
		fields: [classes.courseId],
		references: [courses.id],
	}),
	supervisor: one(supervisors, {
		fields: [classes.supervisorId],
		references: [supervisors.id],
	}),
	students: many(students),
	invitations: many(invitations),
}));

export const studentRelations = relations(students, ({ one, many }) => ({
	user: one(user, { fields: [students.userId], references: [user.id] }),
	class: one(classes, { fields: [students.classId], references: [classes.id] }),
	documents: many(documents),
	placements: many(internshipPlacements),
	shifts: many(studentShifts),
	availabilities: many(studentAvailability),
}));

export const supervisorRelations = relations(supervisors, ({ one, many }) => ({
	user: one(user, { fields: [supervisors.userId], references: [user.id] }),
	school: one(schools, {
		fields: [supervisors.schoolId],
		references: [schools.id],
	}),
	classes: many(classes),
}));

export const hospitalManagerRelations = relations(hospitalManagers, ({ one }) => ({
	user: one(user, {
		fields: [hospitalManagers.userId],
		references: [user.id],
	}),
	hospital: one(hospitals, {
		fields: [hospitalManagers.hospitalId],
		references: [hospitals.id],
	}),
}));

export const preceptorRelations = relations(preceptors, ({ one, many }) => ({
	user: one(user, { fields: [preceptors.userId], references: [user.id] }),
	hospital: one(hospitals, {
		fields: [preceptors.hospitalId],
		references: [hospitals.id],
	}),
	shifts: many(shifts),
	availabilities: many(preceptorAvailability),
}));

export const shiftRelations = relations(shifts, ({ one, many }) => ({
	hospital: one(hospitals, {
		fields: [shifts.hospitalId],
		references: [hospitals.id],
	}),
	preceptor: one(preceptors, {
		fields: [shifts.preceptorId],
		references: [preceptors.id],
	}),
	students: many(studentShifts),
}));

export const studentShiftRelations = relations(studentShifts, ({ one }) => ({
	student: one(students, {
		fields: [studentShifts.studentId],
		references: [students.id],
	}),
	shift: one(shifts, {
		fields: [studentShifts.shiftId],
		references: [shifts.id],
	}),
}));

export const documentRelations = relations(documents, ({ one }) => ({
	student: one(students, {
		fields: [documents.studentId],
		references: [students.id],
	}),
	verifier: one(user, {
		fields: [documents.verifiedBy],
		references: [user.id],
	}),
}));

export const placementRelations = relations(internshipPlacements, ({ one }) => ({
	student: one(students, {
		fields: [internshipPlacements.studentId],
		references: [students.id],
	}),
	hospital: one(hospitals, {
		fields: [internshipPlacements.hospitalId],
		references: [hospitals.id],
	}),
}));

export const invitationRelations = relations(invitations, ({ one }) => ({
	inviter: one(user, {
		fields: [invitations.invitedBy],
		references: [user.id],
	}),
	class: one(classes, {
		fields: [invitations.classId],
		references: [classes.id],
	}),
	hospital: one(hospitals, {
		fields: [invitations.hospitalId],
		references: [hospitals.id],
	}),
}));

export const studentAvailabilityRelations = relations(studentAvailability, ({ one }) => ({
	student: one(students, {
		fields: [studentAvailability.studentId],
		references: [students.id],
	}),
}));

export const preceptorAvailabilityRelations = relations(preceptorAvailability, ({ one }) => ({
	preceptor: one(preceptors, {
		fields: [preceptorAvailability.preceptorId],
		references: [preceptors.id],
	}),
}));
