import { isValidFilePath } from "./checkValidPath.js";
import { getDefaultBranch } from "./getCurrentBranch.js";
import { execSync } from "child_process";
import { CONFIG } from "../config.js";

/**
 * Get file changes and full diff from last commit
 */
export const getChangesFromLastCommit = async () => {
  const runGitCommand = (command) => {
    try {
      const output = execSync(command, { encoding: CONFIG.ENCODING });
      return output.split(/\r?\n/).filter((file) => file.trim() !== "");
    } catch (error) {
      console.debug(`ℹ️ Command failed (${command}):`, error.message);
      return [];
    }
  };

  const runGitDiff = (command) => {
    try {
      return execSync(command, { encoding: CONFIG.ENCODING });
    } catch (error) {
      console.debug(`ℹ️ Diff command failed (${command}):`, error.message);
      return "";
    }
  };

  try {
    console.log("🔍 Checking for changes...");

    // Verify git repo
    try {
      execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    } catch {
      console.error("❌ Not a Git repository");
      return { files: [], diff: "" };
    }

    // Get current branch
    let currentBranch = "unknown";
    try {
      currentBranch = execSync("git branch --show-current", {
        encoding: CONFIG.ENCODING,
      }).trim();
      console.log(`ℹ️ Current branch: ${currentBranch}`);
    } catch {
      console.warn("⚠ Could not determine current branch");
    }

    // Fetch latest changes (optional)
    try {
      execSync("git fetch origin", { stdio: "ignore" });
    } catch {
      console.warn("⚠ Could not fetch from origin");
    }

    const baseBranch = getDefaultBranch();
    console.log(`ℹ️ Comparing against base branch: ${baseBranch}`);

    // Methods to detect changes
    const changeMethods = [
      {
        name: "compare current and last commit",
        command: "git --no-pager diff HEAD^ HEAD --color=never --unified=9999",
        isDiff: true,
      },
      {
        name: "remote branch comparison",
        command: `git diff --name-only origin/${baseBranch}...HEAD`,
        isDiff: false,
      },
      {
        name: "local branch comparison",
        command: `git diff --name-only ${baseBranch}...HEAD`,
        isDiff: false,
      },
      {
        name: "uncommitted changes",
        command: "git diff --name-only",
        isDiff: false,
      },
      {
        name: "last commit changes",
        command: "git diff --name-only HEAD~1..HEAD",
        isDiff: false,
      },
    ];

    for (const method of changeMethods) {
      if (method.isDiff) {
        const diffContent = runGitDiff(method.command);
        if (diffContent.trim()) {
          const files = diffContent
            .split(/\r?\n/)
            .filter((line) => isValidFilePath(line));
          console.log(`✅ Found changes (${method.name}):`);
          files.forEach((f) => console.log(`  - ${f}`));
          return { files, diff: diffContent };
        }
      } else {
        const files = runGitCommand(method.command).filter(isValidFilePath);
        if (files.length > 0) {
          console.log(`✅ Found changed files (${method.name}):`);
          files.forEach((f) => console.log(`  - ${f}`));
          // Also fetch full diff for these files
          const diffContent = files
            .map((file) =>
              runGitDiff(
                `git --no-pager diff HEAD^ HEAD --color=never -- ${file}`
              )
            )
            .join("\n");
          return { files, diff: diffContent };
        }
      }
    }

    console.warn("⚠ No changes detected");
    return { files: [], diff: "" };
  } catch (error) {
    console.error(`❌ Failed to get git changes: ${error.message}`);
    return { files: [], diff: "" };
  }
};
