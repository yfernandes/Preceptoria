import { treaty } from "@elysiajs/eden";
import type { app } from "@server";

export const api = treaty<app>("localhost:3001");
