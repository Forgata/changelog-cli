#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "node:fs";
import { analyzeCommits } from "./ai.js";
import { getBranchCommits } from "./git.js";
import { getChangelogPath, prependToChangelog } from "./io.js";
import path from "node:path";

async function ensureApiKey(): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  const localEnvPath = path.resolve(process.cwd(), ".env");

  if (fs.existsSync(localEnvPath)) {
    const envContent = fs.readFileSync(localEnvPath, "utf8");
    const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.*)$/m);
    if (match && match[1]) {
      return match[1].trim().replace(/['"']/g, "");
    }
  }

  console.error("\nError: GEMINI_API_KEY is missing.");
  console.log(
    "------------------------------------------------------------------",
  );
  console.log(
    "To use changelog-cli, you need a free API key from Google AI Studio.",
  );
  console.log(
    "Please expose it in your environment or add it to your local .env file:",
  );
  console.log("\n  Windows (CMD):   set GEMINI_API_KEY=your_key_here");
  console.log('  Linux/macOS:     export GEMINI_API_KEY="your_key_here"');
  console.log("  Project .env:    GEMINI_API_KEY=your_key_here");
  console.log(
    "------------------------------------------------------------------\n",
  );

  process.exit(1);
}

async function main() {
  const flags = process.argv.slice(2);

  console.log("Changelog Init");
  const apiKey = await ensureApiKey();
  process.env.GEMINI_API_KEY = apiKey;

  try {
    const commits = await getBranchCommits("main");

    if (commits.length === 0) {
      console.log("No new commits detected on this branch compared to main.");
      return;
    }

    const currentHeadHash = execSync("git rev-parse HEAD", {
      encoding: "utf8",
    }).trim();

    if (fs.existsSync(getChangelogPath())) {
      const currentChangelog = fs.readFileSync(getChangelogPath(), "utf8");

      if (currentChangelog.includes(``)) {
        console.log(
          "The latest updates from this branch are already documented in CHANGELOG.md. Skipping run to prevent duplication.",
        );
        return;
      }
    }

    console.log(`Extracted ${commits.length} commits successfully:`);
    commits.forEach((commit, index) => {
      console.log(`   ${index + 1}. "${commit}"`);
    });

    console.log("Submitting commits to Gemini for release evaluation...");

    const analysisResult = await analyzeCommits(commits);

    if (analysisResult.bump === "none") {
      console.log(
        "Gemini determined these updates do not warrant a new release block. Exiting.",
      );
      return;
    }

    console.log(
      `Gemini recommended a [${analysisResult.bump.toUpperCase()}] version advancement.`,
    );
    let newVersion: string | undefined;

    if (flags.includes("--version")) {
      console.log(
        `Executing: npm version ${analysisResult.bump} --no-git-tag-version`,
      );
      newVersion = execSync(
        `npm version ${analysisResult.bump} --no-git-tag-version`,
        {
          encoding: "utf8",
        },
      ).trim();
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const versionHeader = `## [${newVersion ? newVersion : "Unreleased"}] - ${currentDate}\n`;

    const finalMarkdown = analysisResult.markdown.replace(
      "## [VERSION] - YYYY-MM-DD",
      `${versionHeader}\n`,
    );

    prependToChangelog(finalMarkdown);

    console.log(
      newVersion
        ? "\n CHANGELOG.md, package.json, and package-lock.json have been updated successfully!"
        : "\n CHANGELOG.md has been updated successfully!",
    );
    console.log(
      "Run 'git status' to inspect mutations before staging your branch commit.",
    );
  } catch (error) {
    console.error("ERROR", (error as Error).message);
    process.exit(1);
  }
}

main();
