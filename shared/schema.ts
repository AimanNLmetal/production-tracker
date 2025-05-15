import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("operator"), // "operator" or "management"
  operatorId: text("operator_id"), // Only for operators
});

export const processes = [
  "Welding Jig",
  "Welding Bracket",
  "Mul.Drilling",
  "Buffing",
  "Chromatic In",
  "Chromatic Out",
  "Painting",
  "Balancing",
  "QAQC",
] as const;

export const models = [
  "NTSU",
  "NTRB",
  "NTSN",
  "NTSM",
  "NTSW",
  "NTSX",
  "NTSY",
  "NTST",
  "NTSZ",
  "NTSJ",
] as const;

export const times = [
  "9.45am",
  "11.30am",
  "2.45pm",
  "5pm",
  "8pm",
  "8am",
] as const;

// Regular stations (1-7) for most processes
export const regularStations = ["1", "2", "3", "4", "5", "6", "7"] as const;

// Special stations (F, G, H) for Mul.Drilling
export const drillingStations = ["F", "G", "H"] as const;

export const stationsByProcess = {
  "Mul.Drilling": drillingStations,
  default: regularStations,
} as const;

export const productionEntries = pgTable("production_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Reference to the user who created the entry
  operatorId: text("operator_id").notNull(), // Operator ID (string format, e.g., "12275")
  process: text("process").notNull(),
  station: text("station").notNull(),
  time: text("time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productionDetails = pgTable("production_details", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(), // Reference to the production entry
  model: text("model").notNull(),
  quantity: doublePrecision("quantity").notNull(), // Using double to support decimal quantities (e.g., 15.5)
});

export const instructions = pgTable("instructions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Reference to the user who created the instruction
  type: text("type").notNull(), // E.g., "Increase output", "Quality check"
  targetProcess: text("target_process").notNull(),
  targetStation: text("target_station").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for insertion
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProductionEntrySchema = createInsertSchema(productionEntries).omit({ id: true, createdAt: true });
export const insertProductionDetailSchema = createInsertSchema(productionDetails).omit({ id: true });
export const insertInstructionSchema = createInsertSchema(instructions).omit({ id: true, createdAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ProductionEntry = typeof productionEntries.$inferSelect;
export type InsertProductionEntry = z.infer<typeof insertProductionEntrySchema>;

export type ProductionDetail = typeof productionDetails.$inferSelect;
export type InsertProductionDetail = z.infer<typeof insertProductionDetailSchema>;

export type Instruction = typeof instructions.$inferSelect;
export type InsertInstruction = z.infer<typeof insertInstructionSchema>;

// Combined type for frontend use
export type ProductionEntryWithDetails = ProductionEntry & {
  details: ProductionDetail[];
};
