import { pgEnum, pgTable, text, timestamp, real, jsonb, index } from "drizzle-orm/pg-core";
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
  amenities: jsonb('amenities').default({}),
  createdById: text('created_by_id').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    // index for text search on name and address
    nameAddressIdx: index("workspace_name_address_idx").on(table.name, table.address),
    // index for location-based queries
    locationIdx: index("workspace_location_idx").on(table.latitude, table.longitude),
    // index for filtering by venue type
    venueTypeIdx: index("workspace_venue_type_idx").on(table.venueType),
    // index for creator lookups
    creatorIdx: index("workspace_creator_idx").on(table.createdById),
  };
});

export const workspaceReport = pgTable('workspace_report', {
  id: text("id").primaryKey(),
  workspaceId: text('workspace_id').references(() => workspace.id, { onDelete: "cascade" }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: "cascade" }).notNull(),
  crowdLevel: levelEnum('crowd_level').notNull(),
  noiseLevel: levelEnum('noise_level').notNull(),
  wifiSpeed: real('wifi_speed'),
  notes: text('notes'),
  reportedAt: timestamp('reported_at').notNull().defaultNow(),
}, (table) => {
  return {
    // index for finding reports by workspace
    workspaceIdx: index("workspace_report_workspace_idx").on(table.workspaceId),
    // index for finding reports by user
    userIdx: index("workspace_report_user_idx").on(table.userId),
    // index for sorting by time
    timeIdx: index("workspace_report_time_idx").on(table.reportedAt),
  };
});

export const favorite = pgTable('favorite', {
  id: text("id").primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: "cascade" }).notNull(),
  workspaceId: text('workspace_id').references(() => workspace.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    userWorkspaceIdx: index("favorite_user_workspace_idx").on(table.userId, table.workspaceId),
  };
});