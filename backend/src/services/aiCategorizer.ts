import { Types } from "mongoose";

interface CategorizationResult {
  category: "technical" | "billing" | "general" | "feature-request" | "bug-report";
  priority: "low" | "medium" | "high" | "urgent";
  confidence: number;
}

export class AICategorizer {
  /**
   * Mock AI categorization service
   * In production, this would integrate with OpenAI API, Claude API, or custom ML model
   */
  static categorizeTicket(title: string, description: string): CategorizationResult {
    const text = `${title} ${description}`.toLowerCase();

    let category: CategorizationResult["category"] = "general";
    let priority: CategorizationResult["priority"] = "medium";
    let confidence = 0.7;

    // Category detection
    if (this.containsKeywords(text, ["bug", "error", "crash", "broken", "not working", "issue", "problem"])) {
      category = "bug-report";
      priority = "high";
      confidence = 0.9;
    } else if (this.containsKeywords(text, ["feature", "enhancement", "request", "add", "new", "implement"])) {
      category = "feature-request";
      priority = "low";
      confidence = 0.8;
    } else if (this.containsKeywords(text, ["billing", "payment", "invoice", "charge", "subscription", "refund"])) {
      category = "billing";
      priority = "medium";
      confidence = 0.85;
    } else if (this.containsKeywords(text, ["technical", "api", "integration", "server", "database", "code", "development"])) {
      category = "technical";
      priority = "high";
      confidence = 0.8;
    }

    // Priority escalation
    if (this.containsKeywords(text, ["urgent", "asap", "immediately", "critical", "emergency", "down", "outage"])) {
      priority = "urgent";
      confidence = Math.min(confidence + 0.1, 1.0);
    } else if (this.containsKeywords(text, ["minor", "cosmetic", "nice to have", "when possible"])) {
      priority = "low";
    }

    // Add randomness for realism
    const randomFactor = Math.random() * 0.2 - 0.1;
    confidence = Math.max(0.5, Math.min(1.0, confidence + randomFactor));

    return {
      category,
      priority,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  /**
   * Check if text contains any of the specified keywords
   */
  private static containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Get a random agent for auto-assignment
   */
  static async getRandomAgent(): Promise<string | null> {
    try {
      const { User } = await import("../models/User");

      // Explicit type for lean result
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

  /**
   * Enhanced categorization with OpenAI fallback
   */
  static async categorizeWithAI(title: string, description: string): Promise<CategorizationResult> {
    try {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Analyze this support ticket and categorize it:\n\nTitle: ${title}\nDescription: ${description}\n\nRespond with JSON:\n{\n  "category": "technical|billing|general|feature-request|bug-report",\n  "priority": "low|medium|high|urgent",\n  "confidence": 0.0-1.0\n}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message?.content?.trim();
      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      const parsed = JSON.parse(content) as CategorizationResult;

      // Ensure valid output
      return {
        category: parsed.category,
        priority: parsed.priority,
        confidence: Math.min(Math.max(parsed.confidence, 0.5), 1.0),
      };
    } catch (error) {
      console.error("OpenAI categorization failed, falling back to mock:", error);
      return this.categorizeTicket(title, description);
    }
  }
}
