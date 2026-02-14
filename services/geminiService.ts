
import { GoogleGenAI, Type } from "@google/genai";
import { Article, FeedbackResponse, UserAnswers } from "../types.ts";

/**
 * 初始化 AI 客戶端，並檢查環境變數
 */
const getAiClient = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey) {
    console.warn("API_KEY 尚未就緒。");
    throw new Error("找不到 API 密鑰，請檢查環境設定。");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * 生成每日訓練文章
 */
export const generateDailyArticle = async (): Promise<Article> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "請以繁體中文撰寫一篇具備深度的知識性文章。範圍：腦科學、認知心理學、未來技術或複雜系統論。字數約 800 字。文章必須結構嚴密，包含核心痛點、解決方案、以及底層運行邏輯。這篇文章將用於訓練使用者的深度理解能力，請確保內容不是淺顯的科普，而是具有拆解價值的論點。",
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

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("AI 返回了空內容");
  return JSON.parse(jsonStr);
};

/**
 * 評估使用者的理解程度
 */
export const evaluateComprehension = async (article: Article, answers: UserAnswers): Promise<FeedbackResponse> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      身為資深導師，請評估學生對《${article.title}》的分析。
      
      學生提交的數據：
      - 核心問題分析：${answers.problemSolved}
      - 支撐論點：${answers.logicStructures.join(', ')}
      - 費曼式複述：${answers.retellSummary}
      - 深度提問：${answers.questions.join(', ')}
      
      請依據其是否洞察本質、邏輯完整性、表達清晰度給予 0-100 的評分，並提供具體的改進建議。
    `,
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

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("AI 返回了空評估");
  return JSON.parse(jsonStr);
};
