import { promises as fs } from "fs";
import path from "path";
import { generatePRbyGemini } from "./services/gemini.service.js";
import { CONFIG } from "./config.js";
import { ensureDirectoryExists } from "./utils/checkDir.js";
import { generateTimestamp } from "./utils/generateTimestamp.js";
import { getChangesFromLastCommit } from "./utils/detectChanges.js";
import { readFileContents } from "./utils/readFileContents.js";
import { sendEmail } from "./services/mail.service.js";
import { sendToDiscord } from "./services/discord.service.js";

/**
 * Main review process
 */
const processCommitReview = async () => {
  try {
    console.log("🚀 Starting commit review process...");
    console.log("ℹ️ Working directory:", process.cwd());

    const changedFiles = await getChangesFromLastCommit();
    if (changedFiles.length === 0) {
      console.log("🛑 No changes to review");
      console.log("\n💡 Try these commands to debug:");
      console.log("  git status");
      console.log("  git log --oneline -n 3");
      console.log("  git diff --name-only HEAD~1..HEAD");
      return;
    }

    console.log("📄 Reading file contents...");
    const fileContents = await readFileContents(changedFiles);

    console.log("🧠 Generating review...");
    let review;
    try {
      review = await generatePRbyGemini(fileContents);
      if (!review) {
        console.error(
          "❌ Failed to generate review: Gemini API returned empty response"
        );
        return;
      }
    } catch (error) {
      console.error("❌ Failed to generate review:", error.message);
      return;
    }

    const reviewPath = path.join(
      CONFIG.REVIEWS_DIR,
      `${review.prTitle.split(" ").join("_")}.md`
    );
    await ensureDirectoryExists(CONFIG.REVIEWS_DIR);
    try {
      await fs.writeFile(reviewPath, review.prDetails, CONFIG.ENCODING);
      console.log(`✅ Review saved to: ${reviewPath}`);
    } catch (error) {
      console.error(
        `❌ Failed to save review to ${reviewPath}:`,
        error.message
      );
      return;
    }
    ///console.log("📧 Sending email...");
    try {
      // await sendEmail(review);
      //console.log("✅ Email sent");
      //console.log("Sending on Discord..");
      //await sendToDiscord(review);
      //console.log("✅ AI review sent to Discord!");
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return;
    }
  } catch (error) {
    console.error("💥 Process failed:", error.message);
    process.exit(1);
  }
};

processCommitReview();
