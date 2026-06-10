import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface AIResponse {
  bump: "major" | "minor" | "patch" | "none";
  markdown: string;
}

export async function analyzeCommits(commits: string[]): Promise<AIResponse> {
  const promt = `You are an elite software release engineer specializing in automated release management. Analyze this array of commit messages, determine the appropriate SemVer bump, and generate a precise markdown changelog block that matches our project's exact writing style and structure.

Commits to parse:
${JSON.stringify(commits, null, 2)}

Strict Formatting & Writing Style Rules:
1. **Strict Markdown Headers**: Group entries ONLY under these exact Keep a Changelog categories: "Added", "Changed", "Deprecated", "Removed", "Fixed", or "Security". Omit any category header that contains no entries. Do NOT use "New Features", "Bug Fixes", "Improvements", or "Breaking Changes".
2. **Bold-Anchored Style**: Every single bullet point MUST begin with a concise, bolded architectural feature, technical component, or file layer followed by a colon (e.g., "- **Component Name:** Detailed explanation.").
3. **Technical Precision & Prose**: Elevate messy, brief, or shorthand commit messages into highly professional, descriptive sentences. Explicitly reference technical layers, variable names, routing mechanisms, endpoints, or CSS classes where applicable (e.g., "Refactored runtime element initialization from...", "Decoupled logic from...").
4. **Header Placeholders**: Always begin the top markdown string header exactly with: "## [VERSION] - YYYY-MM-DD" followed by a blank line.
5. **No Emojis**: Do not include emojis anywhere in the text.

Example of our target output style (always include the top header line and brief introduction):

## [VERSION] - YYYY-MM-DD

### Added
- **AI-Powered Diagnostics:** Integrated Google's ultra-low-latency model via the REST API to deliver instant telemetry summaries.

### Changed
- **Client Routing:** Updated frontend network pipelines to route traffic locally through relative endpoints (\`/api/speed-summary\`).

### Security
- **Credential Protection:** Migrated tokens out of front-facing asset directories into isolated runtime environment containers.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: promt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bump: {
              type: Type.STRING,
              enum: ["major", "minor", "patch", "none"],
              description: "The semantic versioning increment type required.",
            },
            markdown: {
              type: Type.STRING,
              description:
                "The polished markdown release block with placeholders following conventional changelog.md format",
            },
          },
          required: ["bump", "markdown"],
        },
      },
    });

    if (!response.text) throw new Error("Received Empty Response from Gemini");
    return JSON.parse(response.text) as AIResponse;
  } catch (error) {
    throw new Error(
      `Failed to analyze commits. Internal Error: ${(error as Error).message}`,
    );
  }
}
