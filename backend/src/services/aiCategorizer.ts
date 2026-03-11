import { Types } from "mongoose";

type TicketCategory = "technical" | "billing" | "general" | "feature-request" | "bug-report";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface CategorizationResult {
  category: TicketCategory;
  priority: TicketPriority;
  confidence: number;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

const VALID_CATEGORIES: TicketCategory[] = [
  "technical",
  "billing",
  "general",
  "feature-request",
  "bug-report",
];

const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export class AICategorizer {
  static categorizeTicket(title: string, description: string): CategorizationResult {
    const text = `${title} ${description}`.toLowerCase();

    let category: TicketCategory = "general";
    let priority: TicketPriority = "medium";
    let confidence = 0.76;

    if (this.containsKeywords(text, ["bug", "error", "crash", "broken", "not working", "issue", "problem"])) {
      category = "bug-report";
      priority = "high";
      confidence = 0.9;
    } else if (this.containsKeywords(text, ["feature", "enhancement", "request", "add", "new", "implement"])) {
      category = "feature-request";
      priority = "low";
      confidence = 0.82;
    } else if (this.containsKeywords(text, ["billing", "payment", "invoice", "charge", "subscription", "refund"])) {
      category = "billing";
      priority = "medium";
      confidence = 0.86;
    } else if (this.containsKeywords(text, ["technical", "api", "integration", "server", "database", "code", "development"])) {
      category = "technical";
      priority = "high";
      confidence = 0.81;
    }

    if (this.containsKeywords(text, ["urgent", "asap", "immediately", "critical", "emergency", "down", "outage"])) {
      priority = "urgent";
      confidence = Math.min(confidence + 0.08, 0.98);
    } else if (this.containsKeywords(text, ["minor", "cosmetic", "nice to have", "when possible"])) {
      priority = "low";
    }

    return {
      category,
      priority,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  private static containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  private static stripCodeFences(content: string): string {
    return content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  }

  private static sanitizeResult(result: Partial<CategorizationResult>): CategorizationResult {
    const fallback = this.categorizeTicket("", "");

    const category = VALID_CATEGORIES.includes(result.category as TicketCategory)
      ? (result.category as TicketCategory)
      : fallback.category;

    const priority = VALID_PRIORITIES.includes(result.priority as TicketPriority)
      ? (result.priority as TicketPriority)
      : fallback.priority;

    const rawConfidence = Number(result.confidence);
    const confidence = Number.isFinite(rawConfidence)
      ? Math.min(Math.max(rawConfidence, 0.5), 1)
      : fallback.confidence;

    return {
      category,
      priority,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  private static async categorizeWithGroq(title: string, description: string): Promise<CategorizationResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You classify support tickets. Return only valid JSON with category, priority, and confidence. " +
                "Allowed category values: technical, billing, general, feature-request, bug-report. " +
                "Allowed priority values: low, medium, high, urgent. Confidence must be between 0.5 and 1.0.",
            },
            {
              role: "user",
              content: `Title: ${title}\nDescription: ${description}`,
            },
          ],
        }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as GroqChatCompletionResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message || `Groq request failed with status ${response.status}`);
      }

      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Groq returned an empty completion");
      }

      const parsed = JSON.parse(this.stripCodeFences(content)) as Partial<CategorizationResult>;
      return this.sanitizeResult(parsed);
    } finally {
      clearTimeout(timeout);
    }
  }

  static async getRandomAgent(): Promise<string | null> {
    try {
      const { User } = await import("../models/User");
      const agents = await User.find({ role: "agent" })
        .select("_id")
        .lean<{ _id: Types.ObjectId }[]>();

      if (!agents || agents.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * agents.length);
      return agents[randomIndex]._id.toString();
    } catch (error) {
      console.error("Error getting random agent:", error);
      return null;
    }
  }

  static async categorizeWithAI(title: string, description: string): Promise<CategorizationResult> {
    try {
      return await this.categorizeWithGroq(title, description);
    } catch (error) {
      console.error("Groq categorization failed, falling back to keyword rules:", error);
      return this.categorizeTicket(title, description);
    }
  }
}
