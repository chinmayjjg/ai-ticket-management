"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AICategorizer = void 0;
const VALID_CATEGORIES = [
    "technical",
    "billing",
    "general",
    "feature-request",
    "bug-report",
];
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];
class AICategorizer {
    static categorizeTicket(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        let category = "general";
        let priority = "medium";
        let confidence = 0.76;
        if (this.containsKeywords(text, ["bug", "error", "crash", "broken", "not working", "issue", "problem"])) {
            category = "bug-report";
            priority = "high";
            confidence = 0.9;
        }
        else if (this.containsKeywords(text, ["feature", "enhancement", "request", "add", "new", "implement"])) {
            category = "feature-request";
            priority = "low";
            confidence = 0.82;
        }
        else if (this.containsKeywords(text, ["billing", "payment", "invoice", "charge", "subscription", "refund"])) {
            category = "billing";
            priority = "medium";
            confidence = 0.86;
        }
        else if (this.containsKeywords(text, ["technical", "api", "integration", "server", "database", "code", "development"])) {
            category = "technical";
            priority = "high";
            confidence = 0.81;
        }
        if (this.containsKeywords(text, ["urgent", "asap", "immediately", "critical", "emergency", "down", "outage"])) {
            priority = "urgent";
            confidence = Math.min(confidence + 0.08, 0.98);
        }
        else if (this.containsKeywords(text, ["minor", "cosmetic", "nice to have", "when possible"])) {
            priority = "low";
        }
        return {
            category,
            priority,
            confidence: Math.round(confidence * 100) / 100,
        };
    }
    static containsKeywords(text, keywords) {
        return keywords.some((keyword) => text.includes(keyword));
    }
    static stripCodeFences(content) {
        return content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
    }
    static sanitizeResult(result) {
        const fallback = this.categorizeTicket("", "");
        const category = VALID_CATEGORIES.includes(result.category)
            ? result.category
            : fallback.category;
        const priority = VALID_PRIORITIES.includes(result.priority)
            ? result.priority
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
    static async categorizeWithGroq(title, description) {
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
                            content: "You classify support tickets. Return only valid JSON with category, priority, and confidence. " +
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
            const payload = (await response.json());
            if (!response.ok) {
                throw new Error(payload.error?.message || `Groq request failed with status ${response.status}`);
            }
            const content = payload.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error("Groq returned an empty completion");
            }
            const parsed = JSON.parse(this.stripCodeFences(content));
            return this.sanitizeResult(parsed);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    static async getRandomAgent() {
        try {
            const { User } = await Promise.resolve().then(() => __importStar(require("../models/User")));
            const agents = await User.find({ role: "agent" })
                .select("_id")
                .lean();
            if (!agents || agents.length === 0) {
                return null;
            }
            const randomIndex = Math.floor(Math.random() * agents.length);
            return agents[randomIndex]._id.toString();
        }
        catch (error) {
            console.error("Error getting random agent:", error);
            return null;
        }
    }
    static async categorizeWithAI(title, description) {
        try {
            return await this.categorizeWithGroq(title, description);
        }
        catch (error) {
            console.error("Groq categorization failed, falling back to keyword rules:", error);
            return this.categorizeTicket(title, description);
        }
    }
}
exports.AICategorizer = AICategorizer;
