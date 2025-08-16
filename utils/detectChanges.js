import { isValidFilePath } from "./checkValidPath.js";
import { getDefaultBranch } from "./getCurrentBranch.js";
import { execSync } from "child_process";
import { CONFIG } from "../config.js";

/**
 * Enhanced change detection with debugging
 */
export const getChangesFromLastCommit = async () => {
  const getChanges = (command) => {
    if (command === "compare current and last one commit changes") {
      const fullDiff = execSync(
        "git --no-pager diff HEAD^ HEAD --color --unified=9999",
        { encoding: CONFIG.ENCODING }
      );
      const lines = fullDiff.split("\n");
      console.log(lines);

      return;
    }
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
    } catch (error) {
      console.error("❌ Not in a Git repository:", error.message);
      return [];
    }

    // Get current branch name
    let currentBranch;
    try {
      currentBranch = execSync("git branch --show-current", {
        encoding: CONFIG.ENCODING,
      }).trim();
      console.log(`ℹ️ Current branch: ${currentBranch}`);
    } catch (error) {
      console.error("❌ Could not determine current branch:", error.message);
      return [];
    }

    // Fetch updates from origin
    console.log("🔄 Fetching latest changes from origin...");
    try {
      execSync(`git fetch origin`, { stdio: "ignore" });
    } catch (error) {
      console.error("❌ Could not fetch origin:", error.message);
    }

    const baseBranch = getDefaultBranch();
    console.log(`ℹ️ Comparing against base branch: ${baseBranch}`);

    // Try different methods to find changes
    const changeMethods = [
      {
        name: "compare current and last one commit changes",
        command: "git --no-pager diff HEAD^ HEAD --color --unified=9999",
      },
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
      console.log(`ℹ️ Using ${method.name}`);
      console.log(`ℹ️ Found ${changes} changed files`);

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
