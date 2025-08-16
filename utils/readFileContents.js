import { promises as fs } from "fs";
import { CONFIG } from "../config.js";

/**
 * Reads content from multiple files
 */
export const readFileContents = async (filePaths) => {
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
