import type { Context as HonoContext } from "hono";
import { auth } from "./auth";
import { db } from "../db";

export type CreateContextOptions = {
	hono: HonoContext;
};

export async function createContext({ hono }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: hono.req.raw.headers,
	});

	return {
		session,
		db,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;