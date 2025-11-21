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
import { randomUUID } from "crypto";
import { normalizeCompanyName, getStartOfWeek } from "./lib/utils";

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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private introRequests: Map<string, IntroRequest> = new Map();
  private connectorStats: Map<string, ConnectorStats> = new Map();
  private rateLimits: Map<string, RateLimit> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      university: insertUser.university || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getUserContacts(userId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter((contact) => contact.userId === userId);
  }

  async createContact(userId: string, contact: Partial<InsertContact>): Promise<Contact> {
    const id = randomUUID();
    const newContact: Contact = {
      id,
      userId,
      rawText: contact.rawText || "",
      name: contact.name || null,
      email: null,
      phone: null,
      company: contact.company || null,
      title: contact.title || null,
      industry: null,
      seniority: null,
      location: null,
      linkedinUrl: contact.linkedinUrl || null,
      companySize: null,
      fundingStage: null,
      yearsExperience: null,
      skills: null,
      education: null,
      university: null,
      degree: null,
      major: null,
      graduationYear: null,
      recentRoleChange: null,
      industryFit: null,
      enriched: false,
      confidence: null,
      createdAt: new Date(),
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updated = { ...contact, ...updates };
    this.contacts.set(id, updated);
    return updated;
  }

  async getContactsByCompany(companyNormalized: string, excludeUserId?: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter((contact) => {
      if (!contact.company) return false;
      if (excludeUserId && contact.userId === excludeUserId) return false;
      return normalizeCompanyName(contact.company) === companyNormalized;
    });
  }

  async getIntroRequest(id: string): Promise<IntroRequest | undefined> {
    return this.introRequests.get(id);
  }

  async getUserSentRequests(userId: string): Promise<IntroRequest[]> {
    return Array.from(this.introRequests.values())
      .filter((req) => req.requesterId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserReceivedRequests(userId: string): Promise<IntroRequest[]> {
    return Array.from(this.introRequests.values())
      .filter((req) => req.connectorUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createIntroRequest(request: Omit<IntroRequest, "id" | "createdAt" | "updatedAt">): Promise<IntroRequest> {
    const id = randomUUID();
    const newRequest: IntroRequest = {
      ...request,
      id,
      contactId: request.contactId || null,
      messages: request.messages || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.introRequests.set(id, newRequest);
    return newRequest;
  }

  async updateIntroRequest(id: string, updates: Partial<IntroRequest>): Promise<IntroRequest | undefined> {
    const request = this.introRequests.get(id);
    if (!request) return undefined;
    
    const updated = { ...request, ...updates, updatedAt: new Date() };
    this.introRequests.set(id, updated);
    return updated;
  }

  async getConnectorStats(userId: string): Promise<ConnectorStats | undefined> {
    return this.connectorStats.get(userId);
  }

  async updateConnectorStats(userId: string, updates: Partial<ConnectorStats>): Promise<ConnectorStats> {
    let stats = this.connectorStats.get(userId);
    if (!stats) {
      stats = {
        id: randomUUID(),
        userId,
        successCount: 0,
        totalRequests: 0,
        responseRate: 0,
      };
    }
    
    const updated = { ...stats, ...updates };
    if (updated.totalRequests > 0) {
      updated.responseRate = Math.round((updated.successCount / updated.totalRequests) * 100);
    }
    this.connectorStats.set(userId, updated);
    return updated;
  }

  async getRateLimit(userId: string, weekStart: Date): Promise<RateLimit | undefined> {
    return Array.from(this.rateLimits.values()).find(
      (limit) =>
        limit.userId === userId &&
        limit.weekStart.getTime() === weekStart.getTime()
    );
  }

  async createOrUpdateRateLimit(userId: string, weekStart: Date): Promise<RateLimit> {
    let limit = await this.getRateLimit(userId, weekStart);
    if (!limit) {
      limit = {
        id: randomUUID(),
        userId,
        weekStart,
        indirectRequestsCount: 1,
      };
    } else {
      limit.indirectRequestsCount += 1;
    }
    this.rateLimits.set(limit.id, limit);
    return limit;
  }
}

export const storage = new MemStorage();
