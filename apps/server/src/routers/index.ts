import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;