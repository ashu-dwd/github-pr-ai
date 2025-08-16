import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: ".env.local" });

export const CONFIG = {
  REVIEWS_DIR: "reviews",
  TEST_OUTPUT_FILE: "test.json",
  ENCODING: "utf8",
  GIT_TIMEOUT: 10000,
};

export const GMAIL_USER_NAME = process.env.GMAIL_USER_NAME;
export const GMAIL_USER_PASSWORD = process.env.GMAIL_USER_PASSWORD;
export const GMAIL_USER_EMAIL = process.env.GMAIL_USER_EMAIL;
export const GMAIL_RECIEVERS = process.env.GMAIL_RECIEVERS;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME;

let GEMINI_SYSTEM_PROMPT = "";
try {
  GEMINI_SYSTEM_PROMPT = String(fs.readFileSync("gemini_prompt.txt")).replace(
    /[\r\n]+/gm,
    " "
  );
} catch (error) {
  console.error("Failed to read gemini_prompt.txt:", error);
}

export { GEMINI_SYSTEM_PROMPT };

const requiredEnvVariables = [
  "GEMINI_API_KEY",
  "GEMINI_MODEL_NAME",
  "GMAIL_USER_EMAIL",
  "GMAIL_USER_PASSWORD",
  "GMAIL_RECIEVERS",
];

requiredEnvVariables.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
});
