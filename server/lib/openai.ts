import OpenAI from "openai";
import type { EnrichedData, IntroMessage } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function enrichContact(rawText: string): Promise<EnrichedData> {
  try {
    const prompt = `You are a structured data extractor. Input: a single raw contact string or CSV row from a user (could be partial). Output: a single valid JSON object with fields: name, company, title, industry, seniority (e.g. intern/junior/mid/senior/manager), location (city/country if available), confidence (0.0-1.0). If not available, set field to null. Keep values concise.

Example input: "Maya P., Adidas, Product Intern 2023"
Example output:
{"name":"Maya P.", "company":"Adidas", "title":"Product Intern", "industry":"Sports/Retail", "seniority":"intern", "location":null, "confidence":0.87}

Now process this input: ${rawText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a data extraction expert. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      name: result.name || null,
      company: result.company || null,
      title: result.title || null,
      industry: result.industry || null,
      seniority: result.seniority || null,
      location: result.location || null,
      confidence: Math.round((result.confidence || 0.5) * 100),
    };
  } catch (error) {
    console.error("Error enriching contact:", error);
    return {
      name: null,
      company: null,
      title: null,
      industry: null,
      seniority: null,
      location: null,
      confidence: 0,
    };
  }
}

export async function classifyIndustry(companyName: string): Promise<string> {
  try {
    const prompt = `Given a company name, return a single industry tag (one of fintech, consulting, luxury, retail, software, ai-startup, edtech, healthtech, government, other). Output only the tag as plain text.
Company: ${companyName}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content?.trim() || "other";
  } catch (error) {
    console.error("Error classifying industry:", error);
    return "other";
  }
}

export async function generateUserToConnectorMessage(params: {
  requesterName: string;
  requesterInfo: string;
  connectorName: string;
  targetCompany: string;
  reason: string;
}): Promise<IntroMessage> {
  try {
    const prompt = `You are an expert assistant writing a polite short message. The requester wants a connector to introduce them to a contact at ${params.targetCompany}. Generate a 2-3 sentence message that the requester can send to the connector. Include a one-line explanation of why the requester is a fit and a clear ask for a short intro or referral. Keep it under 250 characters. Use this JSON template as output: {"subject":"...", "body":"..."}.

Requester name: ${params.requesterName}
Requester uni/role: ${params.requesterInfo}
Connector name (first): ${params.connectorName}
Target company: ${params.targetCompany}
Reason/goal: ${params.reason}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing professional introduction requests. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      subject: result.subject || `Introduction to ${params.targetCompany}`,
      body: result.body || "",
    };
  } catch (error) {
    console.error("Error generating message:", error);
    return {
      subject: `Introduction to ${params.targetCompany}`,
      body: `Hi ${params.connectorName}, I'm interested in connecting with someone at ${params.targetCompany}. ${params.reason}`,
    };
  }
}

export async function generateConnectorToTargetMessage(params: {
  connectorName: string;
  requesterName: string;
  requesterPitch: string;
  targetCompany: string;
}): Promise<IntroMessage> {
  try {
    const prompt = `You are crafting a short, warm forwardable message for a connector to send to their contact at ${params.targetCompany}. Keep it professional and to the point (max 3 sentences). Include: who you are introducing, one reason they're a good fit, and a soft ask for a 10-15 minute chat or referral. Output JSON: {"subject":"...","body":"..."}.
Connector name: ${params.connectorName}
Requester name: ${params.requesterName}
Requester short pitch: ${params.requesterPitch}
Target contact context: ${params.targetCompany}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing warm introduction emails. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      subject: result.subject || `Introduction: ${params.requesterName}`,
      body: result.body || "",
    };
  } catch (error) {
    console.error("Error generating message:", error);
    return {
      subject: `Introduction: ${params.requesterName}`,
      body: `Hi! I wanted to introduce you to ${params.requesterName}. ${params.requesterPitch}`,
    };
  }
}
