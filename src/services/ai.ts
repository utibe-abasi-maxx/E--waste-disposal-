import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API with automatic key from process.env.API_KEY or GEMINI_API_KEY
const getApiKey = (): string => {
  return (
    (typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) ||
    ((import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ''
  );
};

export class CleanSpotAI {
  private static client: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    const key = getApiKey();
    if (!key) return null;
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: key });
    }
    return this.client;
  }

  // Analyze waste description or image to suggest recyclability tips
  static async getRecyclingAdvice(description: string, wasteType: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      return `Recommended for free collection in Akwa Ibom State. High recovery value for local ${wasteType.toLowerCase()} recyclers.`;
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an eco-assistant for CleanSpot Akwa Ibom in Nigeria. Briefly in 2 short sentences, state the best recycling method and environmental benefit of collecting this waste:
Type: ${wasteType}
Details: ${description}`,
      });
      return response.text || 'Valuable recyclable material for Akwa Ibom circular economy.';
    } catch {
      return `Valuable ${wasteType.toLowerCase()} material ready for free pickup in Akwa Ibom.`;
    }
  }
}
