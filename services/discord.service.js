import fetch from "node-fetch";
import { DISCORD_WEBHOOK } from "../config";

export const sendToDiscord = async (review) => {
  try {
    // Replace existing triple backticks in code to prevent breaking Discord
    review = review.replace(/```/g, "´´´");

    const chunkSize = 1800; // safe margin for formatting
    for (let i = 0; i < review.length; i += chunkSize) {
      const chunk = review.slice(i, i + chunkSize);
      const message = `**AI Commit Review:**\n\`\`\`js\n${chunk}\n\`\`\``;

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
