import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull().default("Custom"),
  prompt: text("prompt").notNull(),
  model: text("model").notNull(),
  apiKey: text("api_key").default(""),
  conductorMonitoring: boolean("conductor_monitoring").default(false),
  status: text("status").default("active"), // active, idle, error
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  role: true,
  prompt: true,
  model: true,
  apiKey: true,
  conductorMonitoring: true,
}).extend({
  name: z.string().min(1, "Agent name is required"),
  role: z.string().min(1, "Role selection is required"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  model: z.string().min(1, "Model selection is required"),
  apiKey: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
