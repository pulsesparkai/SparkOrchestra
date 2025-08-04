import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Clerk user ID for ownership
  name: text("name").notNull(),
  role: text("role").notNull().default("Custom"),
  prompt: text("prompt").notNull(),
  model: text("model").notNull().default("claude-sonnet-4-20250514"),
  encryptedApiKey: text("encrypted_api_key"), // Encrypted API key with bcryptjs
  conductorMonitoring: boolean("conductor_monitoring").default(false),
  status: text("status").default("active"), // active, idle, error
  deletedAt: timestamp("deleted_at"), // For soft delete
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  userId: true,
  name: true,
  role: true,
  prompt: true,
  model: true,
  conductorMonitoring: true,
}).extend({
  name: z.string().min(1, "Agent name is required"),
  role: z.string().min(1, "Role selection is required"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  model: z.string().min(1, "Model selection is required"),
  apiKey: z.string().optional(), // This will be encrypted before storage
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull(),
  userId: text("user_id").notNull(),
  graph: jsonb("graph").notNull(),
  executionOrder: jsonb("execution_order").notNull(),
  status: text("status").notNull().default("pending"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  currentStep: integer("current_step").notNull().default(0),
  totalSteps: integer("total_steps").notNull().default(0),
  context: jsonb("context").notNull().default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const workflowExecutionLogs = pgTable("workflow_execution_logs", {
  id: text("id").primaryKey(),
  workflowExecutionId: text("workflow_execution_id").notNull().references(() => workflowExecutions.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  agentId: text("agent_id").notNull(),
  agentName: text("agent_name").notNull(),
  action: text("action").notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  duration: integer("duration"), 
  tokensUsed: integer("tokens_used"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type WorkflowExecutionLog = typeof workflowExecutionLogs.$inferSelect;
