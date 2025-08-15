import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { get } from "http";
import { generatePRbyGemini } from "./gemini.js";

const getChangesFromLastCommit = async () => {
  const changes = execSync(`git diff-tree --no-commit-id --name-only -r HEAD`)
    .toString()
    .split("\n")
    .filter(Boolean);

  console.log(changes); // This will log the array of changed files
  return changes;
};
//

const readFileContent = (fileNameArray) => {
  let object = {};
  fileNameArray.forEach((fileName) => {
    // const filePath = path.join(process.cwd(), fileName);
    object[fileName] = fs.readFileSync(fileName, "utf8");
  });
  return object;
};

// console.log();
const fileContent = readFileContent(await getChangesFromLastCommit());
console.log(fileContent);
fs.writeFile("test.json", JSON.stringify(fileContent), (err) => {
  if (err) {
    console.error(err);
    return;
  }
});
//'
const aiReview = await generatePRbyGemini(fileContent);
//console.log(aiReview);
fs.writeFile(
  `reviews/review_${new Date()
    .toDateString()
    .replace(/\s/g, "-")}${new Date().getTime()}.md`,
  aiReview,
  (err) => {
    if (err) {
      console.error(err);
      return;
    }
  }
);
//
