import { JWTOption } from "@elysiajs/jwt";

export const JwtOptions: JWTOption = {
	name: "jwt",
	secret: Bun.env.JWT_SECRET,
	exp: "7d",
};
