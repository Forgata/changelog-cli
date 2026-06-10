import path from "node:path";
import fs from "node:fs";

export interface PackageJsonData {
  version: string;
  [key: string]: any;
}

export const getChangelogPath = () =>
  path.resolve(process.cwd(), "CHANGELOG.md");
export const getPackageJsonPath = () =>
  path.resolve(process.cwd(), "package.json");

const STANDARD_HEADER = `# Changelog\n\nAll notable changes will be documented in this file.\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).`;

export function prependToChangelog(newReleaseContent: string): void {
  const targetPath = getChangelogPath();

  if (!fs.existsSync(targetPath)) {
    fs.writeFileSync(
      targetPath,
      `${STANDARD_HEADER}\n\n${newReleaseContent.trim()}\n`,
    );
    return;
  }

  const existingContent = fs.readFileSync(targetPath, "utf8");
  let bodyContent = existingContent.replace(STANDARD_HEADER, "").trim();
  const finalizedContent =
    `${STANDARD_HEADER}\n\n${newReleaseContent.trim()}\n\n${bodyContent}`.trim() +
    "\n";

  fs.writeFileSync(targetPath, finalizedContent);
}

export function readPackageJson(): PackageJsonData {
  const targetPath = getPackageJsonPath();
  if (!fs.existsSync(targetPath)) {
    throw new Error(
      "package.json file not found in the current execution workspace.",
    );
  }
  return JSON.parse(fs.readFileSync(targetPath, "utf8"));
}
