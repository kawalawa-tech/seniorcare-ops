import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Ops Assistant" for 善頤護老 (Senior Care). 
Your context includes the "Residential Care Homes (Elderly Persons) Ordinance" (安老院條例).
When extracting task information, always respond with a valid JSON object matching the requested schema.
`;

export const getGeminiResponse = async (prompt: string, mode: 'chat' | 'extract' | 'summary' = 'chat') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.1, // Lower temperature for more consistent extraction
  };

  if (mode === 'extract') {
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
        recurring: { type: Type.STRING, description: "One of: 單次, 每日, 每週, 每月, 每年" }
      }
    };
  } else {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use flash for faster extraction
      contents: prompt,
      config,
    });
    
    let text = response.text || "";
    
    if (mode === 'chat') {
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        const urls = chunks.map((c: any) => c.web?.uri).filter((u: string) => u);
        if (urls.length > 0) {
          text += "\n\n**參考來源:**\n" + Array.from(new Set(urls)).map(u => `- [${u}](${u})`).join('\n');
        }
      }
    }
    
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return mode === 'extract' ? "{}" : "抱歉，AI 助理目前無法回應。";
  }
};