import { Elysia } from "elysia";
import { RequestContext, Utils, wrap } from "@mikro-orm/core";
import { db } from "@api/db";

/**
 * Applies logging middleware to the Elysia app
 */
export const loggingMiddleware = new Elysia()

	// Database context setup
	.on("beforeHandle", () => {
		RequestContext.enter(db.em);
	})

	// Request logging
	.on("beforeHandle", ({ request }) => {
		const method = (request as Request).method;
		const url = (request as Request).url;
		console.log(`📥 ${new Date().toISOString()} - ${method} ${url}`);
	})

	// Response transformation
	.on("afterHandle", ({ response }) =>
		Utils.isEntity(response) ? wrap(response).toObject() : response
	)

	// Response logging
	.on("afterHandle", ({ request, set }) => {
		const method = (request as Request).method;
		const url = (request as Request).url;
		const statusCode = (set as { status?: number }).status ?? 200;
		const statusEmoji = statusCode >= 400 ? "❌" : "✅";
		console.log(
			`${statusEmoji} ${new Date().toISOString()} - ${method} ${url} - ${statusCode.toString()}`
		);
	})
	.as("global");
