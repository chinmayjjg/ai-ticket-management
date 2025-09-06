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
class AICategorizer {
    /**
     * Mock AI categorization service
     * In production, this would integrate with OpenAI API, Claude API, or custom ML model
     */
    static categorizeTicket(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        let category = "general";
        let priority = "medium";
        let confidence = 0.7;
        // Category detection
        if (this.containsKeywords(text, ["bug", "error", "crash", "broken", "not working", "issue", "problem"])) {
            category = "bug-report";
            priority = "high";
            confidence = 0.9;
        }
        else if (this.containsKeywords(text, ["feature", "enhancement", "request", "add", "new", "implement"])) {
            category = "feature-request";
            priority = "low";
            confidence = 0.8;
        }
        else if (this.containsKeywords(text, ["billing", "payment", "invoice", "charge", "subscription", "refund"])) {
            category = "billing";
            priority = "medium";
            confidence = 0.85;
        }
        else if (this.containsKeywords(text, ["technical", "api", "integration", "server", "database", "code", "development"])) {
            category = "technical";
            priority = "high";
            confidence = 0.8;
        }
        // Priority escalation
        if (this.containsKeywords(text, ["urgent", "asap", "immediately", "critical", "emergency", "down", "outage"])) {
            priority = "urgent";
            confidence = Math.min(confidence + 0.1, 1.0);
        }
        else if (this.containsKeywords(text, ["minor", "cosmetic", "nice to have", "when possible"])) {
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
    static containsKeywords(text, keywords) {
        return keywords.some((keyword) => text.includes(keyword));
    }
    /**
     * Get a random agent for auto-assignment
     */
    static async getRandomAgent() {
        try {
            const { User } = await Promise.resolve().then(() => __importStar(require("../models/User")));
            // Explicit type for lean result
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
    /**
     * Enhanced categorization with OpenAI fallback
     */
    static async categorizeWithAI(title, description) {
        try {
            const { OpenAI } = await Promise.resolve().then(() => __importStar(require("openai")));
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
            const parsed = JSON.parse(content);
            // Ensure valid output
            return {
                category: parsed.category,
                priority: parsed.priority,
                confidence: Math.min(Math.max(parsed.confidence, 0.5), 1.0),
            };
        }
        catch (error) {
            console.error("OpenAI categorization failed, falling back to mock:", error);
            return this.categorizeTicket(title, description);
        }
    }
}
exports.AICategorizer = AICategorizer;
