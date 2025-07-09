import { treatise } from "lib/eden";

export type User = NonNullable<
	Awaited<ReturnType<typeof treatise.auth.signin.post>>["data"]
>["user"];
