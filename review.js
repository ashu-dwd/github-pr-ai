import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";
import { generatePRbyGemini } from "./gemini.js";

/**
 * Configuration constants
 */
const CONFIG = {
  REVIEWS_DIR: "reviews",
  TEST_OUTPUT_FILE: "test.json",
  ENCODING: "utf8",
  GIT_TIMEOUT: 10000,
};

/**
 * Utility functions
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const generateTimestamp = () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.getTime();
  return `${date}_${time}`;
};

const isValidFilePath = (filePath) => {
  return typeof filePath === "string" && filePath.trim().length > 0;
};

/**
 * Gets the list of changed files between origin/main and current HEAD
 * @returns {Promise<string[]>} Array of changed file paths
 */
const getChangesFromLastCommit = async () => {
  try {
    const changes = execSync(`git diff --name-only origin/main...HEAD`, {
      encoding: CONFIG.ENCODING,
      timeout: CONFIG.GIT_TIMEOUT,
    })
      .toString()
      .split("\n")
      .filter(Boolean)
      .filter(isValidFilePath);

    if (changes.length === 0) {
      console.warn("No file changes detected between origin/main and HEAD");
    } else {
      console.log(`Found ${changes.length} changed files:`, changes);
    }

    return changes;
  } catch (error) {
    console.error(`Failed to get git changes: ${error.message}`);
    return [];
  }
};

/**
 * Reads content from multiple files
 * @param {string[]} fileNameArray - Array of file paths to read
 * @returns {Promise<Record<string, string>>} Object mapping file paths to their content
 */
const readFileContents = async (fileNameArray) => {
  if (!Array.isArray(fileNameArray)) {
    console.error("Expected array of file names");
    return {};
  }

  const fileContents = {};

  const readPromises = fileNameArray.map(async (fileName) => {
    try {
      const content = await fs.readFile(fileName, CONFIG.ENCODING);
      fileContents[fileName] = content;
      console.log(`Successfully read file: ${fileName}`);
    } catch (error) {
      console.error(`Error reading file ${fileName}: ${error.message}`);
      fileContents[
        fileName
      ] = `Error: Could not read file content (${error.message})`;
    }
  });

  await Promise.all(readPromises);
  return fileContents;
};

/**
 * Writes content to a file with proper error handling
 * @param {string} filePath - Path where to write the file
 * @param {string} content - Content to write
 * @returns {Promise<boolean>} Success status
 */
const writeFileContent = async (filePath, content) => {
  try {
    const directory = path.dirname(filePath);
    await ensureDirectoryExists(directory);
    await fs.writeFile(filePath, content, CONFIG.ENCODING);
    console.log(`Successfully wrote file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}: ${error.message}`);
    return false;
  }
};

/**
 * Generates review file path with timestamp
 * @returns {string} Review file path
 */
const generateReviewFilePath = () => {
  const timestamp = generateTimestamp();
  return path.join(CONFIG.REVIEWS_DIR, `review_${timestamp}.md`);
};

/**
 * Main function to process commit and generate review
 */
const processCommitReview = async () => {
  try {
    console.log("Starting commit review process...");

    // Get changed files from last commit
    const changedFiles = await getChangesFromLastCommit();
    if (changedFiles.length === 0) {
      console.log("No changes to review");
      return;
    }

    // Read file contents
    console.log("Reading file contents...");
    const fileContents = await readFileContents(changedFiles);

    // Write test output (optional debug file)
    await writeFileContent(
      CONFIG.TEST_OUTPUT_FILE,
      JSON.stringify(fileContents, null, 2)
    );

    // Generate AI review
    console.log("Generating AI review...");
    const aiReview = await generatePRbyGemini(fileContents);

    if (!aiReview) {
      console.error("Failed to generate AI review");
      return;
    }

    // Write review to file
    const reviewFilePath = generateReviewFilePath();
    const success = await writeFileContent(reviewFilePath, aiReview);

    if (success) {
      console.log(`Review completed and saved to: ${reviewFilePath}`);
    } else {
      console.error("Failed to save review file");
    }
  } catch (error) {
    console.error("Error in commit review process:", error.message);
    process.exit(1);
  }
};

// Execute the main function
processCommitReview();
