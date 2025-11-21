import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  university: text("university"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rawText: text("raw_text").notNull(),
  // Basic info
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  // Professional info
  company: text("company"),
  title: text("title"),
  industry: text("industry"),
  seniority: text("seniority"),
  location: text("location"),
  // Detailed enrichment
  companySize: text("company_size"),
  fundingStage: text("funding_stage"),
  yearsExperience: integer("years_experience"),
  skills: text("skills").array(),
  education: text("education"),
  university: text("university"),
  degree: text("degree"),
  major: text("major"),
  graduationYear: integer("graduation_year"),
  // Interest & relevance
  recentRoleChange: boolean("recent_role_change"),
  industryFit: text("industry_fit"),
  linkedinSummary: text("linkedin_summary"),
  // Metadata
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

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  introRequestId: varchar("intro_request_id").notNull().references(() => introRequests.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  linkedinUrl: true,
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

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  introRequestId: true,
  senderId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type IntroRequest = typeof introRequests.$inferSelect;
export type InsertIntroRequest = z.infer<typeof insertIntroRequestSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ConnectorStats = typeof connectorStats.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;

export interface EnrichedData {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  industry: string | null;
  seniority: string | null;
  location: string | null;
  companySize: string | null;
  fundingStage: string | null;
  yearsExperience: number | null;
  skills: string[] | null;
  education: string | null;
  university: string | null;
  degree: string | null;
  major: string | null;
  graduationYear: number | null;
  recentRoleChange: boolean | null;
  industryFit: string | null;
  linkedinSummary: string | null;
  confidence: number;
}

export interface SearchResult {
  direct: Array<Contact & { matchType: "direct" }>;
  indirect: Array<Contact & { 
    connectorName: string;
    connectorId: string;
    connectorStats: {
      successCount: number;
      responseRate: number;
    };
    matchType: "indirect" 
  }>;
}

export interface IntroMessage {
  subject: string;
  body: string;
}
