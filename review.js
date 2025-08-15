import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { get } from "http";

const getChangesFromLastCommit = async () => {
  const changes = execSync(`git diff-tree --no-commit-id --name-only -r HEAD`)
    .toString()
    .split("\n")
    .filter(Boolean);

  console.log(changes); // This will log the array of changed files
};
getChangesFromLastCommit();
