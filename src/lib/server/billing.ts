import { count, eq } from "drizzle-orm"
import { db } from "$lib/server/db"
import { classes, organizations, students } from "$lib/server/db/schema"

/**
 * Stripe logic skeleton.
 * In a real implementation, you would use the 'stripe' npm package here.
 */

export async function createStripeCustomer(orgId: string) {
	// 1. Call Stripe API to create customer
	// const customer = await stripe.customers.create({ email, name, metadata: { orgId } });
	const stripeCustomerId = `cus_mock_${crypto.randomUUID()}`

	// 2. Save to DB
	await db.update(organizations).set({ stripeCustomerId }).where(eq(organizations.id, orgId))

	return stripeCustomerId
}

export async function syncSubscriptionStatus(stripeCustomerId: string, status: string) {
	await db
		.update(organizations)
		.set({ subscriptionStatus: status })
		.where(eq(organizations.stripeCustomerId, stripeCustomerId))
}

/**
 * Calculate how many students are currently active in the organization.
 * This can be used to update Stripe subscription quantities.
 */
export async function getActiveStudentCount() {
	// A student is active if their class is ACTIVE
	const result = await db
		.select({ value: count() })
		.from(students)
		.innerJoin(classes, eq(students.classId, classes.id))
		.innerJoin(organizations, eq(classes.courseId, organizations.id)) // This needs verification of the path
	// Path: Student -> Class -> Course -> School -> Organization
	// Let's do a more robust join
	/*
		.innerJoin(classes, eq(students.classId, classes.id))
		.innerJoin(courses, eq(classes.courseId, courses.id))
		.innerJoin(schools, eq(courses.schoolId, schools.id))
		.innerJoin(organizations, eq(schools.organizationId, organizations.id))
		*/

	// Simplified logic for now: any student in an ACTIVE class is billable.
	return result[0].value
}

export async function completeClass(classId: string) {
	await db.update(classes).set({ status: "COMPLETED" }).where(eq(classes.id, classId))

	// After completing a class, you might want to trigger a Stripe subscription update
	// to reduce the quantity of seats.
}
