import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Ops Assistant" for 善頤護老 (Senior Care). 
Your context includes the "Residential Care Homes (Elderly Persons) Ordinance" (安老院條例) and the specific services provided by Senior Care.
`;

export const getGeminiResponse = async (prompt: string, mode: 'chat' | 'extract' | 'summary' = 'chat') => {
  // Fix: Directly initialize GoogleGenAI with API key from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.5,
    tools: [{ googleSearch: {} }]
  };

  if (mode === 'extract') {
    // Disable search tool for structured data extraction to allow JSON response mode
    delete config.tools; 
    config.responseMimeType = "application/json";
    config.responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        location: { type: Type.STRING },
        assignees: { type: Type.ARRAY, items: { type: Type.STRING } },
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
      model: "gemini-3-pro-preview",
      contents: prompt,
      config,
    });
    
    // Fix: Access text property directly (it is a property, not a method)
    let text = response.text || "";
    
    // Fix: Always extract and display website URLs from grounding chunks when using Google Search
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const urls = chunks.map((c: any) => c.web?.uri).filter((u: string) => u);
      if (urls.length > 0) {
        text += "\n\n**參考來源:**\n" + Array.from(new Set(urls)).map(u => `- [${u}](${u})`).join('\n');
      }
    }
    
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    // Return empty JSON object for extraction failures or fallback message for chat
    return mode === 'extract' ? "{}" : "抱歉，AI 助理目前無法回應。";
  }
};