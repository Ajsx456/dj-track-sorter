import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  duration: integer("duration"), // in seconds
  liked: boolean("liked"),
  processed: boolean("processed").default(false),
  filePath: text("file_path").notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;

// Frontend types
export interface ProcessedTrack extends Track {
  audioUrl?: string;
  waveformData?: number[];
}

export interface SortingSession {
  id: string;
  tracks: ProcessedTrack[];
  currentIndex: number;
  likedTracks: ProcessedTrack[];
  dislikedTracks: ProcessedTrack[];
  statistics: {
    totalListened: number;
    totalSaved: number;
    totalRemoved: number;
  };
}
