
export const JwtOptions: { name: string; secret: string | Uint8Array; exp: string } = {
	name: "jwt",
	secret: Bun.env.JWT_SECRET!,
	exp: "7d",
};
