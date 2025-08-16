import { execSync } from "child_process";
import { CONFIG } from "../config.js";

/**
 * Gets the default branch name with enhanced debugging
 */
export const getDefaultBranch = () => {
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
