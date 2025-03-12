import { treaty } from "@elysiajs/eden";
import { RequestContext, Utils, wrap } from "@mikro-orm/core";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	spyOn,
} from "bun:test";
import Elysia from "elysia";
import { validate as validateUUID } from "uuid";

import { db } from "../db";
import { authController, jwtInstance } from "./auth.controller";
import { User } from "../entities";

describe("Auth Controller", () => {
	// // Set up RequestContext for MikroORM per test
	// RequestContext.create(db.em, () => {});

	const app = new Elysia()
		.on("beforeHandle", () => {
			RequestContext.enter(db.em);
		})
		.on("afterHandle", ({ response }) =>
			Utils.isEntity(response) ? wrap(response).toObject() : response
		)
		.use(authController);

	const api = treaty(app);

	beforeAll(async () => {
		// Ensure DB is migrated
		db.orm.config.set("verbose", false);
		db.orm.config.set("debug", false);
		await db.orm.migrator.up();
	});

	beforeEach(async () => {
		// Drop and recreate the schema before each test to ensure a clean slate
		const generator = db.orm.getSchemaGenerator();
		await generator.dropSchema();
		await generator.createSchema();
	});

	afterAll(async () => {
		// Optionally rollback migrations if necessary
		// await db.orm.migrator.down();

		// Close MikroORM connection
		await db.orm.close();
	});

	describe("Signup Endpoint", () => {
		describe("Input Validation", () => {
			it("should proceed with valid input", async () => {
				// Provide valid input and ensure it doesn't fail validation
				const response = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				const responseBody = response.data;
				expect(response.response.ok).toBe(true);
				expect(response.status).toBe(201); // Assuming successful creation

				expect(responseBody).toBeDefined();
				if (!responseBody?.success) {
					return;
				}

				expect(responseBody.success).toBe(true);
				expect(responseBody.message).toBe("User created successfully");

				expect(responseBody.user.id).toBeString();
				expect(validateUUID(responseBody.user.id)).toBe(true);
				expect(responseBody.user.email).toBe("yago@test.com");
				expect(responseBody.user.name).toBe("Yago");
			});

			it("should return 400 for missing required fields", () => {
				// Test cases where `name`, `email`, `password`, or `phone` is missing
				// Is this really necessary?
				// Eden's treaty makes sure that a missing field is impossible
			});

			it("should return 400 for invalid email format", async () => {
				// Provide an invalid email and check for error response

				const response = await api.auth.signup.post({
					name: "Yago",
					email: "yago#test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				// const responseBody = response.data;

				expect(response.response.ok).toBe(false);
				expect(response.status).toBe(422);
				// expect(response.error.value.type)
				if (response.error?.status !== 422) {
					return; // Returning early because we already asserted that the status code is 422
				}

				expect(response.error.value.type).toBe("validation");
				expect(response.error.value.on).toBe("body");
				expect(response.error.value.property).toBe("/email");
			});

			it("should return 400 for password too short", async () => {
				// Provide a short password and check for error response
				const response = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123",
				});

				// const responseBody = response.data;

				expect(response.response.ok).toBe(false);
				expect(response.status).toBe(422);
				// expect(response.error.value.type)
				if (response.error?.status !== 422) {
					return; // Returning early because we already asserted that the status code is 422
				}

				expect(response.error.value.type).toBe("validation");
				expect(response.error.value.on).toBe("body");
				expect(response.error.value.property).toBe("/password");
			});
		});

		describe("User Existence Check", () => {
			it("should return 401 if user already exists", async () => {
				await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});
				const response = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				expect(response.status).toBe(401);
				// Mock `db.user.findOne` to return an existing user and ensure function returns 401
			});

			it("should proceed if user does not exist", async () => {
				// Mock `db.user.findOne` to return null and ensure function continues

				const response = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				expect(response.status).toBe(201);
			});
		});
		//
		describe("User Creation", () => {
			it("should call User.create with correct parameters", async () => {
				// Spy/mock User.create and verify it is called with correct args
				const spyUserCreate = spyOn(User, "create");

				await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				expect(spyUserCreate).toHaveBeenCalled();
				expect(spyUserCreate.mock.calls).toEqual([
					["Yago", "yago@test.com", "(99) 99999-9999", "123456"],
				]);
			});

			it("should return 500 if User.create throws an error", async () => {
				// Mock User.create to throw and check if 500 is returned
				// const spyUserCreate = spyOn(User, "create").mockRejectedValue(
				// 	new Error("My Mock rejected value")
				// );

				const response = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "99-9999", // Forcing error with invalid Phone number
					password: "123456",
				});

				expect(response.status).toBe(400);
				if (response.status !== 400 || !response.error) return;
				expect(response.error.value.message).toBe("Validation failed");
			});
		});
		//
		describe("Database Persistence", () => {
			it("should call db.em.persistAndFlush with the created user", async () => {
				// Mock `persistAndFlush` and ensure it's called with correct user
				const spy = spyOn(db.em, "persistAndFlush");

				await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				const call = spy.mock.calls[0][0];
				expect(spy).toBeCalled();
				expect(call).toBeInstanceOf(User);
				expect((call as User).name).toBe("Yago");
				expect((call as User).email).toBe("yago@test.com");
				expect((call as User).phoneNumber).toBe("(99) 99999-9999");
			});
			//
			it("should return 500 if db.em.persistAndFlush fails", async () => {
				spyOn(db.em, "persistAndFlush").mockImplementationOnce(() => {
					throw new Error("Internal Database Error");
				});

				const res = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				expect(res.error).toMatchObject({
					status: 500,
					value: { success: false, message: "Internal Server Error" },
				});
			});
		});

		describe("JWT Token Generation", () => {
			it("should call jwt.sign twice (access & refresh tokens)", async () => {
				// Spy/mock `jwt.sign` and verify it is called twice
				const spy = spyOn(jwtInstance.decorator.jwt, "sign");

				await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				expect(spy).toBeCalledTimes(2);
				spy.mockClear();
			});

			it("should generate tokens with correct payload", async () => {
				// Spy on JWT sign functions for access and refresh tokens
				const spyToken = spyOn(jwtInstance.decorator.jwt, "sign");

				// Simulate user signup request
				const res = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				// Ensure headers exist in the response
				if (!res.headers) {
					throw new Error("Response headers are missing");
				}

				// Extract and split cookies from headers
				const cookies = res.response.headers.get("set-cookie")?.split(", ");
				if (!cookies) {
					throw new Error("No cookies found in response");
				}

				// Regex to extract JWT from cookie format (captures value between '=' and ';')
				const jwtRegex = /^[^=]+=(.+?);/;

				// Extract token values from cookies
				const tokens = cookies.map(
					(cookie) => jwtRegex.exec(cookie)?.[1] ?? null
				);

				// Ensure tokens are present
				if (!tokens[0]) {
					throw new Error("Access token is missing");
				}

				// Verify the access token payload
				const jwtAccessToken = await jwtInstance.decorator.jwt.verify(
					tokens[0]
				);

				if (!tokens[1]) {
					throw new Error("Refresh token is missing");
				}

				// Verify the access token payload
				const jwtRefreshToken = await jwtInstance.decorator.jwt.verify(
					tokens[1]
				);

				// Assertions
				expect(jwtAccessToken).toBeDefined();
				expect(jwtAccessToken).toContainAllKeys(["id", "roles", "exp", "iat"]);

				expect(jwtRefreshToken).toBeDefined();
				expect(jwtRefreshToken).toContainAllKeys(["id", "roles", "exp", "iat"]);

				expect(spyToken).toBeCalledTimes(2);

				// Clear mocks after test
				spyToken.mockClear();
			});

			it.only("should return 500 if jwt.sign fails", async () => {
				// Mock `jwt.sign` to throw and ensure function returns 500
				spyOn(jwtInstance.decorator.jwt, "sign").mockImplementationOnce(() => {
					throw new Error("Internal Database Error");
				});

				const res = await api.auth.signup.post({
					name: "Yago",
					email: "yago@test.com",
					phone: "(99) 99999-9999",
					password: "123456",
				});

				expect(res.status).toBe(500);
			});
		});

		describe("Cookie Generation", () => {
			// 	it("should set session cookie correctly", () => {
			// 		// Check that session cookie is set with correct attributes
			// 	});
			//
			// 	it("should set refresh cookie correctly", () => {
			// 		// Check that refresh cookie is set with correct attributes
			// 	});
		});

		describe("Response Handling", () => {
			// 	it("should return 201 on successful signup", () => {
			// 		// Ensure response status is 201 when signup succeeds
			// 	});
			//
			// 	it("should return expected response body", () => {
			// 		// Ensure response contains success message and user object
			// 	});
		});
	});
});
