import type { EnrichedData, IntroMessage } from "@shared/schema";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function extractJSON(text: string): Record<string, any> {
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonStr);
  }
  return {};
}

async function callDeepseek(
  systemPrompt: string,
  userPrompt: string,
  model: string = "deepseek-chat"
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable is not set");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content || "";
}

export async function enrichContact(rawText: string): Promise<EnrichedData> {
  try {
    const prompt = `You are a detailed contact enrichment expert. Extract comprehensive structured data from the input. Output ONLY a valid JSON object with these fields (set to null if unavailable): name, email, phone, company, title, industry, seniority (intern/junior/mid/senior/manager/director), location, companySize (startup/small/medium/large/enterprise), fundingStage (bootstrapped/seed/series-a/series-b/public), yearsExperience (number), skills (array of strings), education, university, degree (BS/BA/MS/MBA/PhD), major, graduationYear (number), recentRoleChange (boolean), industryFit (string describing relevance), linkedinSummary (2-3 sentence professional summary like a LinkedIn headline and about section), confidence (0.0-1.0).

Example input: "Sarah Chen, sarah@techcorp.com, TechCorp, Senior Product Manager, Stanford BS CS 2016, 7 years fintech"
Example output:
{"name":"Sarah Chen","email":"sarah@techcorp.com","phone":null,"company":"TechCorp","title":"Senior Product Manager","industry":"fintech","seniority":"senior","location":null,"companySize":"large","fundingStage":"series-b","yearsExperience":7,"skills":["product management","fintech","leadership"],"education":"Stanford","university":"Stanford","degree":"BS","major":"Computer Science","graduationYear":2016,"recentRoleChange":false,"industryFit":"Strong fintech background and PM expertise","linkedinSummary":"Senior Product Manager at TechCorp with 7 years of experience building fintech solutions. Stanford CS graduate passionate about user-centric product design.","confidence":0.92}

Now extract detailed data from: ${rawText}`;

    const content = await callDeepseek(
      "You are a detailed data extraction expert. Always respond with valid JSON only. Extract all available information comprehensively.",
      prompt
    );

    const result = extractJSON(content);

    return {
      name: result.name || null,
      email: result.email || null,
      phone: result.phone || null,
      company: result.company || null,
      title: result.title || null,
      industry: result.industry || null,
      seniority: result.seniority || null,
      location: result.location || null,
      companySize: result.companySize || null,
      fundingStage: result.fundingStage || null,
      yearsExperience: result.yearsExperience || null,
      skills: result.skills || null,
      education: result.education || null,
      university: result.university || null,
      degree: result.degree || null,
      major: result.major || null,
      graduationYear: result.graduationYear || null,
      recentRoleChange: result.recentRoleChange || null,
      industryFit: result.industryFit || null,
      linkedinSummary: result.linkedinSummary || null,
      confidence: Math.round((result.confidence || 0.5) * 100),
    };
  } catch (error) {
    console.error("Error enriching contact:", error);
    return {
      name: null,
      email: null,
      phone: null,
      company: null,
      title: null,
      industry: null,
      seniority: null,
      location: null,
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
      linkedinSummary: null,
      confidence: 0,
    };
  }
}

export async function classifyIndustry(companyName: string): Promise<string> {
  try {
    const prompt = `Given a company name, return a single industry tag (one of fintech, consulting, luxury, retail, software, ai-startup, edtech, healthtech, government, other). Output only the tag as plain text.
Company: ${companyName}`;

    const content = await callDeepseek(
      "You are an industry classification expert. Respond with only the industry tag.",
      prompt
    );

    return content.trim() || "other";
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

    const content = await callDeepseek(
      "You are an expert at writing professional introduction requests. Respond with valid JSON only.",
      prompt
    );

    const result = extractJSON(content);
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

export async function analyzeSearchQuery(query: string): Promise<{
  company?: string;
  industry?: string;
  role?: string;
  seniority?: string;
  location?: string;
}> {
  try {
    const prompt = `Parse this search query and extract the user's intent. They're looking for people in their network. Return a JSON object with fields: company (specific company name if mentioned), industry (industry name if mentioned), role (job title/role if mentioned), seniority (career level: intern/junior/mid/senior), location (city/country if mentioned). If not mentioned, set to null.

Search query: "${query}"

Example: "fintech intern in Paris" -> {"company":null,"industry":"fintech","role":null,"seniority":"intern","location":"Paris"}`;

    const content = await callDeepseek(
      "You are a search query analyzer. Respond with valid JSON only.",
      prompt
    );

    const result = extractJSON(content);
    return {
      company: result.company || undefined,
      industry: result.industry || undefined,
      role: result.role || undefined,
      seniority: result.seniority || undefined,
      location: result.location || undefined,
    };
  } catch (error) {
    console.error("Error analyzing search query:", error);
    return {};
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

    const content = await callDeepseek(
      "You are an expert at writing warm introduction emails. Respond with valid JSON only.",
      prompt
    );

    const result = extractJSON(content);
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
