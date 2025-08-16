import fetch from "node-fetch";
import { DISCORD_WEBHOOK } from "../config.js";

export const sendToDiscord = async (review) => {
  try {
    // Replace existing triple backticks in code to prevent breaking Discord
    const chunkSize = 1800; // safe for Discord
    for (let i = 0; i < review.length; i += chunkSize) {
      const chunk = review.slice(i, i + chunkSize);

      // Wrap in markdown code block
      const message = `**AI Commit Review (Part ${
        Math.floor(i / chunkSize) + 1
      }):**\n\`\`\`js\n${chunk}\n\`\`\``;

      const res = await fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Failed to send chunk:", text);
      }
    }

    console.log("✅ Full AI review sent to Discord in chunks!");
  } catch (err) {
    console.error("❌ Discord send error:", err.message);
  }
};
