import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { eq, and, inArray, desc, sql, or } from "drizzle-orm";
import { workspace, workspaceReport, favorite, venueTypeEnum, levelEnum } from "../db/schema/workspace";
import { nanoid } from "nanoid";

const amenitiesSchema = z.object({
  wifi: z.boolean().optional(),
  powerOutlets: z.boolean().optional(),
  quietEnvironment: z.boolean().optional(),
  coffee: z.boolean().optional(),
  food: z.boolean().optional(),
  outdoorSeating: z.boolean().optional(),
});

export const workspaceRouter = router({
  // Get workspaces with filtering
  getWorkspaces: publicProcedure
    .input(z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      radius: z.number().optional(), // in km
      venueTypes: z.array(z.enum(['cafe', 'library', 'coworking', 'other'])).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {

      const db = (ctx as any).db;
      
      let query = db.select().from(workspace);
      
      if (input.venueTypes && input.venueTypes.length > 0) {
        query = query.where(inArray(workspace.venueType, input.venueTypes));
      }
      
      return query.limit(input.limit).offset(input.offset);
    }),
    
  getWorkspace: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const db = (ctx as any).db;
      
      const result = await db.select().from(workspace)
        .where(eq(workspace.id, input.id))
        .limit(1);
        
      if (result.length === 0) {
        throw new Error("Workspace not found");
      }
      
      const reports = await db.select().from(workspaceReport)
        .where(eq(workspaceReport.workspaceId, input.id))
        .orderBy(desc(workspaceReport.reportedAt))
        .limit(10);
        
      const averages = reports.length > 0 
        ? {
            crowdLevel: reports.reduce((sum: number, report: { crowdLevel: string; }) => sum + parseInt(report.crowdLevel), 0) / reports.length,
            noiseLevel: reports.reduce((sum: number, report: { noiseLevel: string; }) => sum + parseInt(report.noiseLevel), 0) / reports.length,
            wifiSpeed: reports.filter((r: { wifiSpeed: any; }) => r.wifiSpeed).reduce((sum: any, report: { wifiSpeed: any; }) => sum + (report.wifiSpeed || 0), 0) / 
                      reports.filter((r: { wifiSpeed: any; }) => r.wifiSpeed).length || null,
          }
        : null;
      
      let isFavorited = false;
      if (ctx.session) {
        const favorites = await db.select().from(favorite)
          .where(and(
            eq(favorite.workspaceId, input.id),
            eq(favorite.userId, ctx.session.user.id)
          ))
          .limit(1);
          
        isFavorited = favorites.length > 0;
      }
      
      return {
        ...result[0],
        reports,
        averages,
        isFavorited,
      };
    }),
    
  createWorkspace: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      address: z.string().min(1).max(200),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      venueType: z.enum(['cafe', 'library', 'coworking', 'other']),
      amenities: amenitiesSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = (ctx as any).db;
      const id = nanoid();
      
      const result = await db.insert(workspace).values({
        id,
        name: input.name,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        venueType: input.venueType,
        amenities: input.amenities,
        createdById: ctx.session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      return result[0];
    }),
    
  submitReport: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      crowdLevel: z.enum(['1', '2', '3', '4', '5']),
      noiseLevel: z.enum(['1', '2', '3', '4', '5']),
      wifiSpeed: z.number().optional(),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = (ctx as any).db;
      const id = nanoid();
      
      const result = await db.insert(workspaceReport).values({
        id,
        workspaceId: input.workspaceId,
        userId: ctx.session.user.id,
        crowdLevel: input.crowdLevel,
        noiseLevel: input.noiseLevel,
        wifiSpeed: input.wifiSpeed,
        notes: input.notes,
        reportedAt: new Date(),
      }).returning();
      
      return result[0];
    }),
    
  toggleFavorite: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = (ctx as any).db;
      
      const existing = await db.select().from(favorite)
        .where(and(
          eq(favorite.workspaceId, input.workspaceId),
          eq(favorite.userId, ctx.session.user.id)
        ))
        .limit(1);
        
      if (existing.length > 0) {

        await db.delete(favorite)
          .where(eq(favorite.id, existing[0].id));
          
        return { favorited: false };
      } else {

        const id = nanoid();
        
        await db.insert(favorite).values({
          id,
          workspaceId: input.workspaceId,
          userId: ctx.session.user.id,
          createdAt: new Date(),
        });
        
        return { favorited: true };
      }
    }),
    
  getFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      const db = (ctx as any).db;
      
      const userFavorites = await db.select({
        workspace,
        favoriteId: favorite.id,
      })
      .from(favorite)
      .innerJoin(workspace, eq(workspace.id, favorite.workspaceId))
      .where(eq(favorite.userId, ctx.session.user.id));
      
      return userFavorites.map((item: { workspace: any; favoriteId: any; }) => ({
        ...item.workspace,
        favoriteId: item.favoriteId,
      }));
    }),
    
  searchWorkspaces: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const db = (ctx as any).db;
      
      return db.select().from(workspace)
        .where(
          or(
            sql`${workspace.name} ILIKE ${`%${input.query}%`}`,
            sql`${workspace.address} ILIKE ${`%${input.query}%`}`
          )
        )
        .limit(input.limit);
    }),
});