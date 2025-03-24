import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { db } from "./db";

const app = new Hono();

app.use(logger());

app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: async (_opts, hono) => {
      const context = await createContext({ hono });
      return {
        ...context,
        db, 
      };
    },
    onError({ error, path }) {
      console.error(`Error in tRPC handler for ${path}:`, error);
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

app.get("/db-setup", async (c) => {
  try {
	await db.query.workspace.findMany({ limit: 1 });
    // await db.query.workspace.findMany().limit(1);
    return c.json({ success: true, message: "Database connection successful" });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ success: false, message: "Database connection failed" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);