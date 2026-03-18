type TicketCategory = "technical" | "billing" | "general" | "feature-request" | "bug-report";
type TicketPriority = "low" | "medium" | "high" | "urgent";
interface CategorizationResult {
    category: TicketCategory;
    priority: TicketPriority;
    confidence: number;
}
export declare class AICategorizer {
    static categorizeTicket(title: string, description: string): CategorizationResult;
    private static containsKeywords;
    private static stripCodeFences;
    private static sanitizeResult;
    private static categorizeWithGroq;
    static getRandomAgent(): Promise<string | null>;
    static categorizeWithAI(title: string, description: string): Promise<CategorizationResult>;
}
export {};
