type TicketCategory = "technical" | "billing" | "general" | "feature-request" | "bug-report";
type TicketPriority = "low" | "medium" | "high" | "urgent";
interface CategorizationResult {
    category: TicketCategory;
    priority: TicketPriority;
    confidence: number;
}
interface RewriteResult {
    rewrittenDescription: string;
    source: "groq" | "fallback";
}
export declare class AICategorizer {
    static categorizeTicket(title: string, description: string): CategorizationResult;
    private static containsKeywords;
    private static stripCodeFences;
    private static sanitizeResult;
    private static categorizeWithGroq;
    private static normalizeDescription;
    private static fallbackRewriteDescription;
    private static rewriteDescriptionWithGroq;
    static getRandomAgent(): Promise<string | null>;
    static categorizeWithAI(title: string, description: string): Promise<CategorizationResult>;
    static rewriteDescriptionWithAI(description: string): Promise<RewriteResult>;
}
export {};
