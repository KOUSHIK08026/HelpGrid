import { GoogleGenAI, Type } from "@google/genai";
import { Need, Volunteer, Match } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (aiInstance) return aiInstance;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set. AI features are disabled.');
  }
  aiInstance = new GoogleGenAI({ apiKey: key as string });
  return aiInstance;
}

export const geminiService = {
  async matchVolunteers(need: Need, volunteers: Volunteer[]): Promise<Match[]> {
    if (volunteers.length === 0) return [];

    try {
      const ai = getAi();
      const prompt = `
        Task: Match volunteers to a community need based on skills and availability.
        
        Community Need:
        - Title: ${need.title}
        - Description: ${need.description}
        - Required Skills: ${need.requiredSkills.join(', ')}
        - Date: ${need.dateRequired}
        - Urgency: ${need.urgency}
        
        Volunteers:
        ${volunteers.map(v => `- ID: ${v.id}, Name: ${v.name}, Skills: ${v.skills.join(', ')}, Availability: ${v.availability.join(', ')}`).join('\n')}
        
        Return a JSON array of matches, each with volunteerId, volunteerName, confidenceScore (0-1), and a brief reason.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                volunteerId: { type: Type.STRING },
                volunteerName: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              },
              required: ["volunteerId", "volunteerName", "confidenceScore"]
            }
          }
        }
      });

      const rawMatches = JSON.parse(response.text || "[]");
      
      return rawMatches.map((m: any) => ({
        id: crypto.randomUUID(),
        volunteerId: m.volunteerId,
        volunteerName: m.volunteerName,
        ngoId: need.ngoId,
        needId: need.id,
        needTitle: need.title,
        urgency: need.urgency,
        matchDate: new Date().toISOString(),
        confidenceScore: m.confidenceScore
      }));
    } catch (error) {
      console.error("Gemini matching error:", error);
      return [];
    }
  }
};
