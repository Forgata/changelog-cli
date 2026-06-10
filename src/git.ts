import { execSync } from "node:child_process";

export async function getBranchCommits(targetBranch = "main") {
  try {
    const mergeBase = execSync(`git merge-base ${targetBranch} HEAD`, {
      encoding: "utf-8",
    }).trim();

    const delimiter = "---COMMIT_END---";

    const logs = execSync(
      `git log ${mergeBase}..HEAD --format=%B%n${delimiter}`,
      {
        encoding: "utf8",
      },
    ).trim();

    return logs
      ? logs
          .split(delimiter)
          .map((commit) => commit.trim().replace(/\n{2,}/g, "\n"))
          .filter((line) => line.trim().length > 0)
      : [];
  } catch (error: Error | unknown) {
    throw new Error(
      `Git tracking failed. Ensure you are in a valid Git repository and branch '${targetBranch}' exists. Internal Error: ${(error as Error).message}`,
    );
  }
}
