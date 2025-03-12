import { Elysia, t } from "elysia";

import { describe, expect, it } from "bun:test";
import jwt from "./jwt";

// const req = (path: string) => new Request(`http://localhost${path}`)

const post = (path: string, body = {}) =>
	new Request(`http://localhost${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

const app = new Elysia()
	.use(
		jwt({
			name: "jwt",
			secret: "A",
		})
	)
	.post("/sign", ({ jwt, body }) => jwt.sign(body), {
		body: t.Object({
			name: t.String(),
		}),
	})
	.post(
		"/sign-custom",
		({ jwt, body }) =>
			jwt.sign({
				...body,
			}),
		{
			body: t.Object({
				name: t.String(),
				exp: t.Optional(t.Union([t.String(), t.Number()])),
				nbf: t.Optional(t.Union([t.String(), t.Number()])),
			}),
		}
	)
	.post(
		"/verify",
		async ({ jwt, body: { token } }) => await jwt.verify(token),
		{
			body: t.Object({ token: t.String() }),
		}
	);

describe("Static Plugin", () => {
	it("sign JWT", async () => {
		const name = "Shirokami";

		const _sign = await app.handle(post("/sign", { name }));
		const token = await _sign.text();
		const _verified = await app.handle(post("/verify", { token }));

		const signed = await _verified.json();

		expect(token).toMatch(/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/);
		expect(name).toBe(signed.name);
	});

	it("sign JWT custom exp number", async () => {
		const name = "Shirokami";

		const _sign = await app.handle(
			post("/sign-custom", {
				name,
				exp: new Date().valueOf() / 1000 + 900,
			})
		);
		const token = await _sign.text();

		const _verified = await app.handle(post("/verify", { token }));
		const signed = await _verified.json();

		expect(name).toBe(signed.name);
	});
	it("sign JWT custom exp string", async () => {
		const name = "Shirokami";

		const _sign = await app.handle(
			post("/sign-custom", {
				name,
				exp: "15m",
			})
		);
		const token = await _sign.text();

		const _verified = await app.handle(post("/verify", { token }));
		const signed = (await _verified.json()) as {
			name: string;
			exp: number;
			iat: number;
		};

		expect(name).toBe(signed.name);
	});
	it("refuses expired JWT custom exp string", async () => {
		const name = "Shirokami";

		const _sign = await app.handle(
			post("/sign-custom", {
				name,
				exp: "1sec",
			})
		);
		await setTimeout(async () => {
			const token = await _sign.text();

			const _verified = await app.handle(post("/verify", { token }));
			const signed = (await _verified.json()) as {
				name: string;
				exp: number;
				iat: number;
			};

			expect(signed).toBe(false);
		}, 1200);
	});
});
