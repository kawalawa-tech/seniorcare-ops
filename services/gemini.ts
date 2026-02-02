import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Ops Assistant" for 善頤護老 (Senior Care). 
Your context includes the "Residential Care Homes (Elderly Persons) Ordinance" (安老院條例).
When extracting task information, always respond with a valid JSON object matching the requested schema.
The current available assignees are: Chris, Gavin, Jannel.
`;

// 將實例化移至模組層級，避免重複開銷
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (prompt: string, mode: 'chat' | 'extract' | 'summary' = 'chat') => {
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.1,
  };

  if (mode === 'extract') {
    config.responseMimeType = "application/json";
    // 針對結構化提取任務，禁用思考預算以追求最快速度
    config.thinkingConfig = { thinkingBudget: 0 };
    config.responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "簡短的事項標題" },
        location: { type: Type.STRING, description: "心薈, 康薈, 福群, 萬基, 大華, 總部營運" },
        assignees: { type: Type.ARRAY, items: { type: Type.STRING }, description: "從 Chris, Gavin, Jannel 中選擇" },
        category: { type: Type.STRING, description: "維修, HR, 行政, 採購, 護理品質, 消防/安全" },
        priority: { type: Type.STRING, description: "緊急, 一般, 低度" },
        deadline: { type: Type.STRING, description: "YYYY-MM-DD 格式" },
        description: { type: Type.STRING, description: "詳細描述" },
        recurring: { type: Type.STRING, description: "One of: 單次, 每日, 每週, 每月, 每年" }
      },
      required: ["title"]
    };
  } else {
    config.tools = [{ googleSearch: {} }];
    // 聊天模式可以保留預設思考預算以獲得更高質量的答案
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
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
    return mode === 'extract' ? "{}" : "抱歉，AI 助理目前無法回應。請檢查網路連線。";
  }
};