
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Ops Assistant" for 善頤護老 (Senior Care). 
Your context includes the "Residential Care Homes (Elderly Persons) Ordinance" (安老院條例) and the specific services provided by Senior Care (e.g., Zenith, Zenithal, Fortune, Man Kee, Tai Wah homes).

IMPORTANT: You have access to Google Search. When asked about 善頤護老's specific services, home details, or latest news, ALWAYS search the website 'https://www.seniorcare.com.hk' to provide the most accurate and up-to-date information.

Functions:
1. Ops Advice: Provide administrative, regulatory, and facility-specific guidance.
2. Smart Entry: Convert unstructured text into structured task data.
3. Regulatory Compliance: Check against HK laws and Senior Care internal policies.

PRIVACY GUARDRAIL: Automatically redact or ignore any PII like elderly names or HKID numbers.
`;

export const getGeminiResponse = async (prompt: string, mode: 'chat' | 'extract' | 'summary' = 'chat') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.5,
    tools: [{ googleSearch: {} }] // Added search tool for grounding in company data
  };

  if (mode === 'extract') {
    // Extracting doesn't typically use tools as it focuses on structure
    delete config.tools; 
    config.responseMimeType = "application/json";
    config.responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        location: { type: Type.STRING },
        assignees: { 
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        category: { type: Type.STRING },
        priority: { type: Type.STRING },
        deadline: { type: Type.STRING },
        description: { type: Type.STRING },
        isRecurring: { type: Type.BOOLEAN }
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Upgraded for better reasoning and search capabilities
      contents: prompt,
      config,
    });
    
    // Extract grounding URLs if search was used
    let text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const urls = chunks
        .map((c: any) => c.web?.uri)
        .filter((u: string) => u);
      if (urls.length > 0) {
        text += "\n\n**參考來源:**\n" + Array.from(new Set(urls)).map(u => `- [${u}](${u})`).join('\n');
      }
    }
    
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return mode === 'extract' ? "{}" : "抱歉，AI 助理目前無法回應。請檢查網絡或稍後再試。";
  }
};
