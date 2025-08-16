import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";
import { generatePRbyGemini } from "./gemini.js";
import { CONFIG } from "./config.js";
import { ensureDirectoryExists } from "./utils/checkDir.js";
import { generateTimestamp } from "./utils/generateTimestamp.js";
import { getChangesFromLastCommit } from "./utils/detectChanges.js";
import { readFileContents } from "./utils/readFileContents.js";

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
    const review = await generatePRbyGemini(fileContents);
    if (!review) {
      console.error("❌ Failed to generate review");
      return;
    }

    const reviewPath = path.join(
      CONFIG.REVIEWS_DIR,
      `review_${generateTimestamp()}.md`
    );
    await ensureDirectoryExists(CONFIG.REVIEWS_DIR);
    await fs.writeFile(reviewPath, review, CONFIG.ENCODING);
    console.log(`✅ Review saved to: ${reviewPath}`);
  } catch (error) {
    console.error("💥 Process failed:", error.message);
    process.exit(1);
  }
};

processCommitReview();
