import type {
  User,
  InsertUser,
  Contact,
  InsertContact,
  IntroRequest,
  InsertIntroRequest,
  ConnectorStats,
  RateLimit,
} from "@shared/schema";
import { users, contacts, introRequests, connectorStats, rateLimits } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, ne, desc } from "drizzle-orm";
import { normalizeCompanyName, getStartOfWeek } from "./lib/utils";
import pkg from "pg";
const { Pool } = pkg;

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contacts
  getContact(id: string): Promise<Contact | undefined>;
  getUserContacts(userId: string): Promise<Contact[]>;
  createContact(userId: string, contact: Partial<InsertContact>): Promise<Contact>;
  updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined>;
  getContactsByCompany(companyNormalized: string, excludeUserId?: string): Promise<Contact[]>;
  getAllEnrichedContacts(excludeUserId?: string): Promise<Contact[]>;

  // Intro Requests
  getIntroRequest(id: string): Promise<IntroRequest | undefined>;
  getUserSentRequests(userId: string): Promise<IntroRequest[]>;
  getUserReceivedRequests(userId: string): Promise<IntroRequest[]>;
  createIntroRequest(request: Omit<IntroRequest, "id" | "createdAt" | "updatedAt">): Promise<IntroRequest>;
  updateIntroRequest(id: string, updates: Partial<IntroRequest>): Promise<IntroRequest | undefined>;

  // Connector Stats
  getConnectorStats(userId: string): Promise<ConnectorStats | undefined>;
  updateConnectorStats(userId: string, updates: Partial<ConnectorStats>): Promise<ConnectorStats>;

  // Rate Limits
  getRateLimit(userId: string, weekStart: Date): Promise<RateLimit | undefined>;
  createOrUpdateRateLimit(userId: string, weekStart: Date): Promise<RateLimit>;
}

export class DrizzleStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const result = await this.db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async getUserContacts(userId: string): Promise<Contact[]> {
    return await this.db.select().from(contacts).where(eq(contacts.userId, userId));
  }

  async createContact(userId: string, contact: Partial<InsertContact>): Promise<Contact> {
    const result = await this.db
      .insert(contacts)
      .values({
        userId,
        rawText: contact.rawText || "",
        name: contact.name || null,
        company: contact.company || null,
        title: contact.title || null,
        linkedinUrl: contact.linkedinUrl || null,
      })
      .returning();
    return result[0];
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    const result = await this.db.update(contacts).set(updates).where(eq(contacts.id, id)).returning();
    return result[0];
  }

  async getContactsByCompany(companyNormalized: string, excludeUserId?: string): Promise<Contact[]> {
    const filters = [eq(contacts.enriched, true)];
    
    if (excludeUserId) {
      filters.push(ne(contacts.userId, excludeUserId));
    }
    
    // Search for company that matches when normalized
    const allContacts = await this.db.select().from(contacts).where(and(...filters));
    return allContacts.filter((c) => c.company && normalizeCompanyName(c.company) === companyNormalized);
  }

  async getAllEnrichedContacts(excludeUserId?: string): Promise<Contact[]> {
    const filters = [eq(contacts.enriched, true)];
    
    if (excludeUserId) {
      filters.push(ne(contacts.userId, excludeUserId));
    }
    
    return await this.db.select().from(contacts).where(and(...filters));
  }

  async getIntroRequest(id: string): Promise<IntroRequest | undefined> {
    const result = await this.db.select().from(introRequests).where(eq(introRequests.id, id)).limit(1);
    return result[0];
  }

  async getUserSentRequests(userId: string): Promise<IntroRequest[]> {
    return await this.db
      .select()
      .from(introRequests)
      .where(eq(introRequests.requesterId, userId))
      .orderBy(desc(introRequests.createdAt));
  }

  async getUserReceivedRequests(userId: string): Promise<IntroRequest[]> {
    return await this.db
      .select()
      .from(introRequests)
      .where(eq(introRequests.connectorUserId, userId))
      .orderBy(desc(introRequests.createdAt));
  }

  async createIntroRequest(request: Omit<IntroRequest, "id" | "createdAt" | "updatedAt">): Promise<IntroRequest> {
    const result = await this.db.insert(introRequests).values(request).returning();
    return result[0];
  }

  async updateIntroRequest(id: string, updates: Partial<IntroRequest>): Promise<IntroRequest | undefined> {
    const result = await this.db
      .update(introRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(introRequests.id, id))
      .returning();
    return result[0];
  }

  async getConnectorStats(userId: string): Promise<ConnectorStats | undefined> {
    const result = await this.db.select().from(connectorStats).where(eq(connectorStats.userId, userId)).limit(1);
    return result[0];
  }

  async updateConnectorStats(userId: string, updates: Partial<ConnectorStats>): Promise<ConnectorStats> {
    let stats = await this.getConnectorStats(userId);
    
    if (!stats) {
      // Create new stats
      const result = await this.db
        .insert(connectorStats)
        .values({
          userId,
          successCount: updates.successCount || 0,
          totalRequests: updates.totalRequests || 0,
          responseRate: 0,
        })
        .returning();
      stats = result[0];
    } else {
      // Update existing stats
      const updated = { ...stats, ...updates };
      if (updated.totalRequests > 0) {
        updated.responseRate = Math.round((updated.successCount / updated.totalRequests) * 100);
      }
      const result = await this.db.update(connectorStats).set(updated).where(eq(connectorStats.userId, userId)).returning();
      stats = result[0];
    }
    
    return stats;
  }

  async getRateLimit(userId: string, weekStart: Date): Promise<RateLimit | undefined> {
    const result = await this.db
      .select()
      .from(rateLimits)
      .where(and(eq(rateLimits.userId, userId), eq(rateLimits.weekStart, weekStart)))
      .limit(1);
    return result[0];
  }

  async createOrUpdateRateLimit(userId: string, weekStart: Date): Promise<RateLimit> {
    let limit = await this.getRateLimit(userId, weekStart);
    
    if (!limit) {
      const result = await this.db
        .insert(rateLimits)
        .values({
          userId,
          weekStart,
          indirectRequestsCount: 1,
        })
        .returning();
      limit = result[0];
    } else {
      const result = await this.db
        .update(rateLimits)
        .set({ indirectRequestsCount: limit.indirectRequestsCount + 1 })
        .where(and(eq(rateLimits.userId, userId), eq(rateLimits.weekStart, weekStart)))
        .returning();
      limit = result[0];
    }
    
    return limit;
  }
}

export const storage = new DrizzleStorage();
