import { pgEnum, pgTable, text, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const venueTypeEnum = pgEnum('venue_type', ['cafe', 'library', 'coworking', 'other']);
export const levelEnum = pgEnum('level', ['1', '2', '3', '4', '5']);

export const workspace = pgTable('workspace', {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  venueType: venueTypeEnum('venue_type').notNull(),
  amenities: jsonb('amenities').default({}), // WiFi, outlets, etc.
  createdById: text('created_by_id').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const workspaceReport = pgTable('workspace_report', {
  id: text("id").primaryKey(),
  workspaceId: text('workspace_id').references(() => workspace.id, { onDelete: "cascade" }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: "cascade" }).notNull(),
  crowdLevel: levelEnum('crowd_level').notNull(),
  noiseLevel: levelEnum('noise_level').notNull(),
  wifiSpeed: real('wifi_speed'), // Optional, in Mbps
  notes: text('notes'),
  reportedAt: timestamp('reported_at').notNull().defaultNow(),
});

export const favorite = pgTable('favorite', {
  id: text("id").primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: "cascade" }).notNull(),
  workspaceId: text('workspace_id').references(() => workspace.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});