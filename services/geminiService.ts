
import { GoogleGenAI, Type } from "@google/genai";
import { Article, FeedbackResponse, UserAnswers } from "../types.ts";

const getApiKey = () => {
  return localStorage.getItem('COGNILIFT_API_KEY') || ""; 
};

export const generateDailyArticle = async (): Promise<Article> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("MISSING_KEY");
  
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "請用繁體中文生成一篇富有洞察力的知識性文章。主題：神經科學、考古學、材料科學或哲學。要求：具備學術深度，約 600 字。",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          category: { type: Type.STRING },
          problemSolved: { type: Type.STRING }
        },
        required: ["title", "content", "category", "problemSolved"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const evaluateComprehension = async (article: Article, answers: UserAnswers): Promise<FeedbackResponse> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `身為認知教練，請評估使用者對《${article.title}》的理解。\n文章原文：\n${article.content}\n\n使用者回答：\n${answers.problemSolved}\n${answers.retellSummary}\n\n請以 JSON 格式回傳評估。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          logicFeedback: { type: Type.STRING },
          summaryFeedback: { type: Type.STRING },
          questioningFeedback: { type: Type.STRING },
          improvementTip: { type: Type.STRING }
        },
        required: ["score", "logicFeedback", "summaryFeedback", "questioningFeedback", "improvementTip"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
