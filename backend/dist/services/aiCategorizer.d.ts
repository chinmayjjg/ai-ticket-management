interface CategorizationResult {
    category: "technical" | "billing" | "general" | "feature-request" | "bug-report";
    priority: "low" | "medium" | "high" | "urgent";
    confidence: number;
}
export declare class AICategorizer {
    /**
     * Mock AI categorization service
     * In production, this would integrate with OpenAI API, Claude API, or custom ML model
     */
    static categorizeTicket(title: string, description: string): CategorizationResult;
    /**
     * Check if text contains any of the specified keywords
     */
    private static containsKeywords;
    /**
     * Get a random agent for auto-assignment
     */
    static getRandomAgent(): Promise<string | null>;
    /**
     * Enhanced categorization with OpenAI fallback
     */
    static categorizeWithAI(title: string, description: string): Promise<CategorizationResult>;
}
export {};
