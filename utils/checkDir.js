import { promises as fs } from "fs";
/**
 * Utility function to ensure a directory exists
 * @param {string} dirPath - Path to the directory
 */
export const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};
