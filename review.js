import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";
import { generatePRbyGemini } from "./gemini.js";
import { CONFIG } from "./config.js";

/**
 * Utility function to ensure a directory exists
 * @param {string} dirPath - Path to the directory
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Generates a timestamp for file naming
 * @returns {string} Formatted timestamp string (YYYY-MM-DD_epochMs)
 */
const generateTimestamp = () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.getTime();
  return `${date}_${time}`;
};

/**
 * Validates a file path
 * @param {string} filePath - Path to validate
 * @returns {boolean} True if valid path string
 */
const isValidFilePath = (filePath) => {
  // Skip git metadata files and common non-code files
  const excludedPatterns = [
    /\.git(\/|\\|$)/,
    /(^|\/|\\)\.DS_Store$/,
    /(^|\/|\\)Thumbs\.db$/,
  ];

  return (
    typeof filePath === "string" &&
    filePath.trim().length > 0 &&
    !excludedPatterns.some((pattern) => pattern.test(filePath))
  );
};

/**
 * Gets the default branch name with enhanced debugging
 */
const getDefaultBranch = () => {
  try {
    // Method 1: Try git symbolic-ref (modern Git)
    try {
      const result = execSync(`git symbolic-ref refs/remotes/origin/HEAD`, {
        encoding: CONFIG.ENCODING,
        stdio: ["pipe", "pipe", "ignore"],
      }).trim();
      return result.replace(/^refs\/remotes\/origin\//, "");
    } catch {
      console.debug(
        "ℹ️ git symbolic-ref failed, trying alternative methods..."
      );
    }

    // Method 2: Parse git remote show output
    try {
      const remoteInfo = execSync(`git remote show origin`, {
        encoding: CONFIG.ENCODING,
      });
      const match = remoteInfo.match(/HEAD branch: (.+)/);
      if (match) {
        console.debug("ℹ️ Found default branch via git remote show");
        return match[1];
      }
    } catch (error) {
      console.debug("ℹ️ git remote show failed:", error.message);
    }

    // Method 3: Check common branches
    const commonBranches = ["main", "master", "trunk", "develop"];
    for (const branch of commonBranches) {
      try {
        execSync(`git rev-parse --verify origin/${branch}`, {
          stdio: ["ignore", "ignore", "ignore"],
        });
        console.debug(`ℹ️ Assuming default branch is ${branch}`);
        return branch;
      } catch {}
    }

    console.debug('ℹ️ Using "main" as default branch fallback');
    return "main";
  } catch (error) {
    console.error(`❌ Error detecting default branch: ${error.message}`);
    return "main";
  }
};

/**
 * Enhanced change detection with debugging
 */
const getChangesFromLastCommit = async () => {
  const getChanges = (command) => {
    try {
      return execSync(command, { encoding: CONFIG.ENCODING })
        .split("\n")
        .filter((file) => isValidFilePath(file));
    } catch (error) {
      console.debug(`ℹ️ Command failed (${command}):`, error.message);
      return [];
    }
  };

  try {
    console.log("🔍 Checking for changes...");

    // Verify we're in a git repo
    try {
      execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    } catch {
      console.error("❌ Not in a Git repository");
      return [];
    }

    // Get current branch name
    let currentBranch;
    try {
      currentBranch = execSync("git branch --show-current", {
        encoding: CONFIG.ENCODING,
      }).trim();
      console.log(`ℹ️ Current branch: ${currentBranch}`);
    } catch {
      console.error("❌ Could not determine current branch");
      return [];
    }

    // Fetch updates from origin
    console.log("🔄 Fetching latest changes from origin...");
    execSync(`git fetch origin`, { stdio: "ignore" });

    const baseBranch = getDefaultBranch();
    console.log(`ℹ️ Comparing against base branch: ${baseBranch}`);

    // Try different methods to find changes
    const changeMethods = [
      {
        name: "remote branch comparison",
        command: `git diff --name-only origin/${baseBranch}...HEAD`,
      },
      {
        name: "local branch comparison",
        command: `git diff --name-only ${baseBranch}...HEAD`,
      },
      {
        name: "uncommitted changes",
        command: "git diff --name-only",
      },
      {
        name: "last commit changes",
        command: "git diff --name-only HEAD~1..HEAD",
      },
    ];

    for (const method of changeMethods) {
      const changes = getChanges(method.command);
      if (changes.length > 0) {
        console.log(
          `✅ Found ${changes.length} changed files (${method.name}):`
        );
        changes.forEach((file) => console.log(`  - ${file}`));
        return changes;
      }
    }

    console.warn("⚠ No file changes detected");
    return [];
  } catch (error) {
    console.error(`❌ Failed to get git changes: ${error.message}`);
    return [];
  }
};

/**
 * Reads content from multiple files
 */
const readFileContents = async (filePaths) => {
  const contents = {};
  for (const filePath of filePaths) {
    try {
      contents[filePath] = await fs.readFile(filePath, CONFIG.ENCODING);
      console.log(`📖 Read file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error reading ${filePath}: ${error.message}`);
      contents[filePath] = `Error reading file: ${error.message}`;
    }
  }
  return contents;
};

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
