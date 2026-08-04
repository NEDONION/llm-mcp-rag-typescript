# Visitor-first README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the working TypeScript Agent/MCP and RAG demo clearly, surface its existing video, and provide an accurate Quick Start.

**Architecture:** This is a documentation-only rewrite of `README.md`. The README keeps one overall architecture diagram and links to `architecture-diagram.md` for detail, while explicitly separating the Agent and RAG flows.

**Tech Stack:** GitHub-flavored Markdown, Mermaid, Node.js/pnpm command validation

## Global Constraints

- Keep the YouTube thumbnail, target, and concept image URLs exactly unchanged.
- Do not imply that Agent chat currently performs integrated RAG document Q&A.
- Use only scripts, routes, ports, environment keys, versions, and badges verified in the repository.

---

### Task 1: Rewrite the visitor-facing README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-08-05-readme-visitor-first-design.md`
- Produces: A concise project page with the demo video, current scope, Quick Start, entry points, and architecture.

- [x] **Step 1: Capture media and command contracts**

Run: `rg -n 'img.youtube.com|youtube.com/watch|raw.githubusercontent.com' README.md`

Expected: the thumbnail, video target, and concept-image URLs from the design spec.

Run: `node -e "const p=require('./package.json'); console.log(p.packageManager, Object.keys(p.scripts))"`

Expected: the repository pnpm version and available script names.

- [x] **Step 2: Replace the README content**

Use the spec section order. Place the linked video near the top, document setup and entry points before architecture, reduce Mermaid content to one overview, and place the existing concept image after that overview.

- [x] **Step 3: Check structure and scope wording**

Run: `rg -n '^#|^```|img.youtube.com|youtube.com/watch|raw.githubusercontent.com|Agent|RAG' README.md`

Expected: balanced fences, all three media targets, and explicit separation of Agent and RAG paths.

- [x] **Step 4: Validate media and referenced files**

Run: `test "$(rg -o 'https://img.youtube.com/vi/bXcvtlj1xRg/0.jpg' README.md | wc -l | tr -d ' ')" = 1 && test "$(rg -o 'https://www.youtube.com/watch?v=bXcvtlj1xRg' README.md | wc -l | tr -d ' ')" = 1 && test "$(rg -o 'https://raw.githubusercontent.com/NEDONION/my-pics-space/main/20250717172938.png' README.md | wc -l | tr -d ' ')" = 1 && test -f architecture-diagram.md`

Expected: exit code 0.

- [x] **Step 5: Validate the diff**

Run: `git diff --check`

Expected: no output and exit code 0.

- [x] **Step 6: Review and commit**

Run: `git diff -- README.md`

Expected: only the visitor-first rewrite, with the original video and concept image preserved.

```bash
git add README.md docs/superpowers/plans/2026-08-05-readme-visitor-first.md
git commit -m "docs: make README visitor-first"
```
