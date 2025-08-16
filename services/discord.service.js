import fetch from "node-fetch"; // npm i node-fetch
import { DISCORD_WEBHOOK } from "../config.js";

export const sendToDiscord = async (message, webhookUrl) => {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    if (res.ok) {
      console.log("✅ AI review sent to Discord!");
    } else {
      console.error("❌ Failed to send to Discord:", res.statusText);
    }
  } catch (error) {
    console.error("❌ Discord send error:", error.message);
  }
};

//await sendToDiscord("This is test msg again", DISCORD_WEBHOOK);
