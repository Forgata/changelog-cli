# @forgata/changelog-cli

An AI-driven, branch-based automated changelog generator powered by the Google Gemini API. It intelligently isolates your current branch's commit delta relative to `main` or `default branch`, formats the changes according to modern standards, automates semantic version bumping, and utilizes a deterministic tracking fingerprint to prevent duplicate logs.

Designed for fast scanning, high performance, and zero manual overhead.

---

## Key Features

- **Branch Delta Isolation**: Automatically extracts unreleased histories by computing tree differences between your active development branch and `main`.
- **Gemini Engine Intelligence**: Utilizes the modern high-performance `@google/genai` SDK to process raw, unstructured git commit logs into crisp, categorized release summaries conforming to [Keep a Changelog](https://keepachangelog.com/) standards.
- **Deterministic Fingerprinting**: Injects unique Git HEAD hashes into the documentation layout as invisible HTML metadata markers (``). If the branch state hasn't moved, subsequent invocations exit early to preserve API quotas and file integrity.
- **3-Tier Key Resolution**: Operates smoothly without mandatory hardcoding. Scans sequentially for runtime tokens within your shell profile environment variables, workspace `.env` scopes, or displays an interactive fallback guide if missing.
- **Atomic Version Upgrades**: Programmatically matches commit impact weights to Semantic Version targets (`major`, `minor`, `patch`), executing version upgrades inside `package.json` locally using native patterns without spawning unpushed remote tags prematurely.

---

## Installation

Execute the utility instantly on any project without installing a permanent global footprint using `npx`:

```bash
npx @forgata/changelog-cli

```

Alternatively, to register the binary globally across your local operating system terminal environments:

```bash
npm install -g @forgata/changelog-cli
changelog-cli

```

---

## Configuration

The interface requires an active API key from Google AI Studio. The tool attempts to parse this credential using the following hierarchy:

1. **Global Runtime Environment**: Looks directly for `process.env.GEMINI_API_KEY`.
2. **Workspace Env Scope**: Parses a project-root `.env` file for a `GEMINI_API_KEY=your_key_here` definition.
3. **Graceful Exit Instruction**: If unresolved, it safely breaks execution and logs platform-specific configurations to the terminal console.

### Quick Authentication Setup

#### Windows (Command Prompt)

```cmd
set GEMINI_API_KEY=AIzaSy...your_key

```

#### Linux / macOS / Bash

```bash
export GEMINI_API_KEY="AIzaSy...your_key"

```

#### Project Workspace `.env`

```ini
GEMINI_API_KEY=AIzaSy...your_key

```

---

## Usage

Run the module directly inside the root directory of an initialized Git workspace containing a valid `package.json` descriptor.

### Standard Run (Documentation Only)

Generates the release content block, captures the current tracking hash signature, and cleanly prepends the log data to `CHANGELOG.md` while keeping master historical summaries unmutated.

```bash
npx @forgata/changelog-cli

```

### Full Automation Run (With Version Escalation)

Parses the incoming delta tree to weigh code impacts, logs the markdown block, and automatically scales package specifications across `package.json` and `package-lock.json` based on semantic heuristics.

```bash
npx @forgata/changelog-cli --version

```

---

## Implementation Architecture

1. **Delta Calculation**: The binary fires internal child processes (`git cherry main` or evaluation equivalents) to collect all novel commits belonging exclusively to the branch timeline.
2. **AI Classification Matrix**: Raw text points are sorted through context arrays into explicit semantic operational nodes:

- `Added` for new architectural blocks.
- `Changed` for modifications to existing infrastructure layers.
- `Fixed` for isolated defect corrections.

3. **Signature Integration**: The finalized output file text injects tracking elements into the markdown node:

```markdown
## [Unreleased] - 2026-06-10

### Added

- **Stream Processing**: Optimized packet throughput calculations.
```

4. **Idempotency Guardrail**: On consecutive runs, if the current evaluation of `git rev-parse HEAD` is matched inside the document index, operations stop safely to block file pollution:

```text
Changelog Init
Environment check: GEMINI_API_KEY is recognized.
[INFO] The latest updates from this branch are already documented in CHANGELOG.md. Skipping run to prevent duplication.

```

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
