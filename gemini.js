import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const generatePRbyGemini = async () => {
  const response = await openai.chat.completions.create({
    model: process.env.GEMINI_MODEL_NAME,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: "Explain to me how AI works",
      },
    ],
  });

  console.log(response.choices[0].message);
};
