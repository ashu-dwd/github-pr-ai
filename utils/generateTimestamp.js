/**
 * Generates a timestamp for file naming
 * @returns {string} Formatted timestamp string (YYYY-MM-DD_epochMs)
 */
export const generateTimestamp = () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.getTime();
  return `${date}_${time}`;
};
