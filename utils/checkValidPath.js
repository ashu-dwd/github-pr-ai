/**
 * Validates a file path
 * @param {string} filePath - Path to validate
 * @returns {boolean} True if valid path string
 */
export const isValidFilePath = (filePath) => {
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
