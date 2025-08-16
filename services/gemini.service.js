import OpenAI from "openai";
import {
  GEMINI_API_KEY,
  GEMINI_MODEL_NAME,
  GEMINI_SYSTEM_PROMPT,
} from "../config.js";
import { clearResponseString } from "../utils/clearReponse.js";

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const callGeminiAPI = async (filesObject) => {
  const response = await openai.chat.completions.create({
    model: GEMINI_MODEL_NAME,
    messages: [
      {
        role: "system",
        content: GEMINI_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify(filesObject),
      },
    ],
  });
  return response.choices[0].message.content;
};

export const generatePRbyGemini = async (filesObject) => {
  console.log("Calling Gemini API with files:", Object.keys(filesObject));
  const rawResponse = await callGeminiAPI(filesObject);
  //console.log("Gemini API response:", rawResponse);
  return JSON.parse(clearResponseString(rawResponse));
};
