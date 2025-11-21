import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, insertContactSchema, insertIntroRequestSchema } from "@shared/schema";
import type { SearchResult } from "@shared/schema";
import { enrichContact, generateUserToConnectorMessage, generateConnectorToTargetMessage, analyzeSearchQuery } from "./lib/deepseek";
import { normalizeCompanyName, getStartOfWeek } from "./lib/utils";
import Papa from "papaparse";
import multer from "multer";
import { promises as fs } from "fs";
import { join } from "path";
import archiver from "archiver";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await storage.createUser(data);
      return res.json({ user });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.password !== data.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      return res.json({ user });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // Contacts
  app.post("/api/contacts/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = req.body.userId || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }

      const csvText = req.file.buffer.toString("utf-8");
      const parsed = Papa.parse(csvText, { header: true });

      let count = 0;
      for (const row of parsed.data) {
        if (!row || typeof row !== "object") continue;
        
        const rowObj = row as Record<string, string>;
        
        // Check if this is a LinkedIn CSV format
        const isLinkedIn = rowObj["First Name"] || rowObj["Last Name"] || rowObj["Email Address"];
        
        let contactData: any;
        
        if (isLinkedIn) {
          // Parse LinkedIn CSV format
          const firstName = (rowObj["First Name"] || "").trim();
          const lastName = (rowObj["Last Name"] || "").trim();
          const name = `${firstName} ${lastName}`.trim();
          const email = (rowObj["Email Address"] || "").trim();
          const company = (rowObj["Company"] || "").trim();
          const position = (rowObj["Position"] || "").trim();
          const linkedinUrl = (rowObj["URL"] || "").trim();
          const connectedOn = (rowObj["Connected On"] || "").trim();
          
          // Build rawText with all available info for AI enrichment
          const parts = [name, email, company, position, connectedOn, linkedinUrl].filter(Boolean);
          const rawText = parts.join(", ");
          
          if (rawText.trim()) {
            contactData = {
              rawText,
              name: name || undefined,
              linkedinUrl: linkedinUrl || undefined,
            };
            await storage.createContact(userId, contactData);
            count++;
          }
        } else {
          // Fall back to generic CSV parsing
          const rawText = Object.values(rowObj).filter(Boolean).join(", ");
          if (rawText.trim()) {
            await storage.createContact(userId, { rawText });
            count++;
          }
        }
      }

      return res.json({ count });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/contacts/add", async (req, res) => {
    try {
      const userId = req.body.userId || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }

      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(userId, data);

      return res.json({ contact });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/contacts/enrich", async (req, res) => {
    try {
      const userId = req.body.userId || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }

      const contacts = await storage.getUserContacts(userId);
      let enrichedCount = 0;

      for (const contact of contacts) {
        if (contact.enriched) continue;

        const enrichedData = await enrichContact(contact.rawText || contact.name || "");
        
        await storage.updateContact(contact.id, {
          name: enrichedData.name || contact.name,
          company: enrichedData.company || contact.company,
          title: enrichedData.title || contact.title,
          industry: enrichedData.industry,
          seniority: enrichedData.seniority,
          location: enrichedData.location,
          linkedinSummary: enrichedData.linkedinSummary,
          confidence: enrichedData.confidence,
          enriched: true,
        });

        enrichedCount++;
      }

      return res.json({ enriched: enrichedCount });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const contacts = await storage.getUserContacts(userId);
      return res.json({ contacts });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // Search with AI analysis
  app.get("/api/search", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const query = (req.query.q as string) || "";
      if (!query.trim()) {
        return res.json({ direct: [], indirect: [] });
      }

      // Use AI to analyze the search query
      const searchIntent = await analyzeSearchQuery(query);

      // Get user's own contacts for direct matches
      const userContacts = await storage.getUserContacts(userId);
      
      // Find direct matches using AI-analyzed intent (from user's own contacts)
      const directMatches = userContacts.filter((contact) => {
        if (!contact.enriched) return false;
        
        let matches = false;
        
        if (searchIntent.company && contact.company?.toLowerCase().includes(searchIntent.company.toLowerCase())) {
          matches = true;
        }
        if (searchIntent.industry && contact.industry?.toLowerCase().includes(searchIntent.industry.toLowerCase())) {
          matches = true;
        }
        if (searchIntent.role && (contact.title?.toLowerCase().includes(searchIntent.role.toLowerCase()) || contact.title?.toLowerCase().includes(searchIntent.role.toLowerCase()))) {
          matches = true;
        }
        if (searchIntent.seniority && contact.seniority?.toLowerCase().includes(searchIntent.seniority.toLowerCase())) {
          matches = true;
        }
        if (searchIntent.location && contact.location?.toLowerCase().includes(searchIntent.location.toLowerCase())) {
          matches = true;
        }
        
        return matches;
      });

      // Find indirect matches from ALL other users' networks
      const allOtherContacts = await storage.getAllEnrichedContacts(userId);
      
      // Apply same filtering as direct matches
      const matchingIndirectContacts = allOtherContacts.filter((contact) => {
        if (!contact.enriched) return false;
        
        let matches = false;
        
        if (searchIntent.company && contact.company?.toLowerCase().includes(searchIntent.company.toLowerCase())) {
          matches = true;
        }
        if (searchIntent.industry && contact.industry?.toLowerCase().includes(searchIntent.industry.toLowerCase())) {
          matches = true;
        }
        if (searchIntent.role && contact.title?.toLowerCase().includes(searchIntent.role.toLowerCase())) {
          matches = true;
        }
        if (searchIntent.seniority && contact.seniority?.toLowerCase().includes(searchIntent.seniority.toLowerCase())) {
          matches = true;
        }
        if (searchIntent.location && contact.location?.toLowerCase().includes(searchIntent.location.toLowerCase())) {
          matches = true;
        }
        
        return matches;
      });

      // Enrich with connector info
      const allIndirectContacts: Array<typeof allOtherContacts[0] & { connectorName: string; connectorId: string; connectorStats: { successCount: number; responseRate: number }; matchType: "indirect" }> = [];
      
      for (const contact of matchingIndirectContacts) {
        const connectorId = contact.userId;
        const connector = await storage.getUser(connectorId);
        if (!connector) continue;

        const stats = await storage.getConnectorStats(connectorId);
        
        allIndirectContacts.push({
          ...contact,
          connectorName: connector.name.split(" ")[0],
          connectorId,
          connectorStats: {
            successCount: stats?.successCount || 0,
            responseRate: stats?.responseRate || 0,
          },
          matchType: "indirect",
        });
      }

      // Sort by confidence, connector stats, and enrichment quality, then take top 20
      const curatedIndirect = allIndirectContacts
        .sort((a, b) => {
          const confDiff = (b.confidence || 0) - (a.confidence || 0);
          if (confDiff !== 0) return confDiff;
          const statsDiff = (b.connectorStats.successCount + b.connectorStats.responseRate) - (a.connectorStats.successCount + a.connectorStats.responseRate);
          if (statsDiff !== 0) return statsDiff;
          return (b.linkedinSummary?.length || 0) - (a.linkedinSummary?.length || 0);
        })
        .slice(0, 20)
        .map((c) => ({ ...c, matchType: "indirect" as const }));

      const result: SearchResult = {
        direct: directMatches.map((c) => ({ ...c, matchType: "direct" as const })),
        indirect: curatedIndirect,
      };

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // Intro Requests
  app.post("/api/intro/request", async (req, res) => {
    try {
      const userId = req.body.userId || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const data = insertIntroRequestSchema.parse(req.body);
      
      // Check rate limits
      const userContacts = await storage.getUserContacts(userId);
      if (userContacts.length < 5) {
        return res.status(403).json({ error: "You need at least 5 contacts to request introductions" });
      }

      const weekStart = getStartOfWeek();
      const rateLimit = await storage.getRateLimit(userId, weekStart);
      if (rateLimit && rateLimit.indirectRequestsCount >= 3) {
        return res.status(429).json({ error: "You've reached the limit of 3 indirect intro requests per week" });
      }

      // Create request
      const normalized = normalizeCompanyName(data.targetCompany);
      const request = await storage.createIntroRequest({
        requesterId: userId,
        connectorUserId: data.connectorUserId,
        contactId: data.contactId || null,
        targetCompany: data.targetCompany,
        targetCompanyNormalized: normalized,
        reason: data.reason,
        userEssay: data.userEssay || null,
        status: "pending",
        statusUpdates: null,
        messages: null,
      });

      // Update rate limit
      await storage.createOrUpdateRateLimit(userId, weekStart);

      // Update connector stats
      const stats = await storage.getConnectorStats(data.connectorUserId);
      await storage.updateConnectorStats(data.connectorUserId, {
        totalRequests: (stats?.totalRequests || 0) + 1,
      });

      // Generate suggested message
      const requester = await storage.getUser(userId);
      const connector = await storage.getUser(data.connectorUserId);
      
      let suggestedMessage = null;
      if (requester && connector) {
        suggestedMessage = await generateUserToConnectorMessage({
          requesterName: requester.name,
          requesterInfo: requester.university || "early-career professional",
          connectorName: connector.name.split(" ")[0],
          targetCompany: data.targetCompany,
          reason: data.reason,
        });
      }

      return res.json({ request, suggestedMessage });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/intro/respond", async (req, res) => {
    try {
      const userId = req.body.userId || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { requestId, action } = req.body;
      const request = await storage.getIntroRequest(requestId);
      
      if (!request || request.connectorUserId !== userId) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ error: "Request already responded to" });
      }

      const newStatus = action === "accept" ? "accepted" : "declined";
      const updated = await storage.updateIntroRequest(requestId, { status: newStatus });

      // Generate connector-to-target message if accepted
      let message = null;
      if (action === "accept") {
        const requester = await storage.getUser(request.requesterId);
        const connector = await storage.getUser(userId);
        
        if (requester && connector) {
          message = await generateConnectorToTargetMessage({
            connectorName: connector.name,
            requesterName: requester.name,
            requesterPitch: request.reason,
            targetCompany: request.targetCompany,
          });
        }
      }

      return res.json({ request: updated, message });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/intro/complete", async (req, res) => {
    try {
      const userId = req.body.userId || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { requestId } = req.body;
      const request = await storage.getIntroRequest(requestId);
      
      if (!request || request.connectorUserId !== userId) {
        return res.status(404).json({ error: "Request not found" });
      }

      const updated = await storage.updateIntroRequest(requestId, { status: "completed" });

      // Update connector success stats
      const stats = await storage.getConnectorStats(userId);
      await storage.updateConnectorStats(userId, {
        successCount: (stats?.successCount || 0) + 1,
      });

      return res.json({ request: updated });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/intro/sent", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const requests = await storage.getUserSentRequests(userId);
      return res.json(requests);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/intro/received", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const requests = await storage.getUserReceivedRequests(userId);
      return res.json(requests);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // Download project as ZIP
  app.get("/api/download-project", async (req, res) => {
    try {
      const archive = archiver("zip", { zlib: { level: 9 } });
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=confluence-project.zip");
      
      archive.pipe(res);
      
      // Add client and server directories
      archive.directory(join(process.cwd(), "client/src"), "client/src");
      archive.directory(join(process.cwd(), "server"), "server");
      archive.directory(join(process.cwd(), "shared"), "shared");
      
      // Add key config files
      const filesToAdd = [
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "tailwind.config.ts",
        "drizzle.config.ts",
        ".env.example",
      ];
      
      for (const file of filesToAdd) {
        const filePath = join(process.cwd(), file);
        try {
          await fs.access(filePath);
          archive.file(filePath, { name: file });
        } catch {
          // File doesn't exist, skip it
        }
      }
      
      await archive.finalize();
    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to create download" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const notifs = await storage.getUserNotifications(userId);
      return res.json(notifs);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const count = await storage.getUnreadNotificationCount(userId);
      return res.json({ count });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await storage.markAllNotificationsAsRead(userId);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // Translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Missing text or targetLanguage" });
      }

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the given text to ${targetLanguage}. Respond with only the translation, nothing else.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const translated = data.choices[0].message.content || text;

      return res.json({ translated });
    } catch (error: any) {
      console.error("Translation error:", error);
      return res.status(500).json({ error: "Translation failed" });
    }
  });

  // Admin
  app.get("/api/admin/stats", async (req, res) => {
    try {
      // Simple stats aggregation from in-memory storage
      const allUsers = Array.from((storage as any).users.values());
      const allContacts = Array.from((storage as any).contacts.values());
      const allRequests = Array.from((storage as any).introRequests.values());

      const activeIntros = allRequests.filter((r: any) => r.status === "pending" || r.status === "accepted").length;
      const completedIntros = allRequests.filter((r: any) => r.status === "completed").length;
      const totalRequests = allRequests.length;
      const successRate = totalRequests > 0 ? Math.round((completedIntros / totalRequests) * 100) : 0;

      return res.json({
        totalUsers: allUsers.length,
        totalContacts: allContacts.length,
        activeIntros,
        completedIntros,
        successRate,
        avgResponseTime: "24hr",
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
