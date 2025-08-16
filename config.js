import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "C:/Users/Acer/.env.global", override: true });

// Load .env.local file
dotenv.config({ path: ".env.local", override: true });

// __dirname equivalent for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Config constants
export const CONFIG = {
  REVIEWS_DIR: "reviews",
  TEST_OUTPUT_FILE: "test.json",
  ENCODING: "utf8",
  GIT_TIMEOUT: 10000,
};

// Environment variables
export const GMAIL_USER_NAME = process.env.GMAIL_USER_NAME || "";
export const GMAIL_USER_PASSWORD = process.env.GMAIL_USER_PASSWORD || "";
export const GMAIL_USER_EMAIL = process.env.GMAIL_USER_EMAIL || "";
export const GMAIL_RECIEVERS = process.env.GMAIL_RECIEVERS || "";

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "";

// Load system prompt from gemini_prompt.txt
let GEMINI_SYSTEM_PROMPT = "";
try {
  const promptPath = path.join(__dirname, "gemini_prompt.txt");
  if (fs.existsSync(promptPath)) {
    GEMINI_SYSTEM_PROMPT = fs
      .readFileSync(promptPath, "utf8")
      .replace(/[\r\n]+/gm, " ");
  } else {
    console.warn(`⚠️ gemini_prompt.txt not found at: ${promptPath}`);
  }
} catch (error) {
  console.error("Failed to read gemini_prompt.txt:", error.message);
}

export { GEMINI_SYSTEM_PROMPT };

// Required env variables check
const requiredEnvVariables = [
  "GEMINI_API_KEY",
  "GEMINI_MODEL_NAME",
  "GMAIL_USER_EMAIL",
  "GMAIL_USER_PASSWORD",
  "GMAIL_RECIEVERS",
];

requiredEnvVariables.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`❌ Missing environment variable: ${variable}`);
  }
});
