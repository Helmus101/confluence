import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  university: text("university"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rawText: text("raw_text").notNull(),
  name: text("name"),
  company: text("company"),
  title: text("title"),
  industry: text("industry"),
  seniority: text("seniority"),
  location: text("location"),
  linkedinUrl: text("linkedin_url"),
  enriched: boolean("enriched").default(false).notNull(),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const introRequests = pgTable("intro_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  connectorUserId: varchar("connector_user_id").notNull().references(() => users.id),
  contactId: varchar("contact_id").references(() => contacts.id),
  targetCompany: text("target_company").notNull(),
  targetCompanyNormalized: text("target_company_normalized").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  messages: jsonb("messages"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const connectorStats = pgTable("connector_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  successCount: integer("success_count").default(0).notNull(),
  totalRequests: integer("total_requests").default(0).notNull(),
  responseRate: integer("response_rate").default(0).notNull(),
});

export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weekStart: timestamp("week_start").notNull(),
  indirectRequestsCount: integer("indirect_requests_count").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  university: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  rawText: true,
  name: true,
  company: true,
  title: true,
  linkedinUrl: true,
});

export const insertIntroRequestSchema = createInsertSchema(introRequests).pick({
  connectorUserId: true,
  targetCompany: true,
  reason: true,
  contactId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type IntroRequest = typeof introRequests.$inferSelect;
export type InsertIntroRequest = z.infer<typeof insertIntroRequestSchema>;
export type ConnectorStats = typeof connectorStats.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;

export interface EnrichedData {
  name: string | null;
  company: string | null;
  title: string | null;
  industry: string | null;
  seniority: string | null;
  location: string | null;
  confidence: number;
}

export interface SearchResult {
  direct: Array<Contact & { matchType: "direct" }>;
  indirect: Array<{
    company: string;
    companyNormalized: string;
    connectorId: string;
    connectorName: string;
    connectorStats: {
      successCount: number;
      responseRate: number;
    };
    confidence: number;
    matchType: "indirect";
  }>;
}

export interface IntroMessage {
  subject: string;
  body: string;
}
