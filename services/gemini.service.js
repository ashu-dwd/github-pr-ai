import OpenAI from "openai";
import {
  GEMINI_API_KEY,
  GEMINI_MODEL_NAME,
  GEMINI_SYSTEM_PROMPT,
} from "../config.js";

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generatePRbyGemini = async (filesObject) => {
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
  const rawResponse = response.choices[0].message.content;
  return rawResponse;

  //console.log(response.choices[0].message.content);
};
