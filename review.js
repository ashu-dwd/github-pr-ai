import fs from "fs";
import path from "path";
import { execSync } from "child_process";

getChangesFromLastCommit = () => {
  const changes = execSync(
    `git diff-tree --no-commit-id --name-only -r HEAD`
  ).split("\n");
};
