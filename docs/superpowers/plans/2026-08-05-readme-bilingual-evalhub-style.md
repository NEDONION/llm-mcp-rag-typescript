# Bilingual EvalHub-style README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a Chinese-first EvalHub-style root README and an equally complete English version centered on the existing video demo.

**Architecture:** `README.md` becomes the Chinese landing page and `README_EN.md` becomes its English counterpart. Both keep the Agent/MCP and RAG paths separate while moving the video, capability table, and Quick Start into a stronger visitor journey.

**Tech Stack:** GitHub-flavored Markdown, HTML, Mermaid, Node.js command validation

## Global Constraints

- `README.md` is Chinese-first; `README_EN.md` is complete English.
- Both files use a prominent centered `简体中文 · English` language switch.
- Each file retains the YouTube thumbnail, YouTube target, and concept-image URLs exactly once.
- Keep Agent/MCP chat and RAG retrieval separate; retain the `gpt-4`, `uv`, and legacy-entry limitations.
- Add no dependencies, generated media, or runtime behavior.

---

### Task 1: Build and validate both visitor pages

**Files:**
- Modify: `README.md`
- Create: `README_EN.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-08-05-readme-bilingual-evalhub-style-design.md`
- Produces: reciprocal Chinese and English pages with identical current-scope boundaries.

- [x] **Step 1: Capture the three-media contract**

Run: `rg -n 'img.youtube.com|youtube.com/watch|raw.githubusercontent.com' README.md`

Expected: the thumbnail, video target, and concept-image URLs in the design spec.

- [x] **Step 2: Write the Chinese and English pages**

Use the spec's flow and EvalHub's centered identity, navigation, linked video hero and caption,
capability table, current-scope notice, Quick Start, entry-point table, one Mermaid diagram,
concept image, limitations, scripts, references, and contribution sections.

- [x] **Step 3: Validate both pages**

Run: `rg -n '^## |img.youtube.com|youtube.com/watch|raw.githubusercontent.com|README_EN.md|README.md|gpt-4|uvx|legacy|^```' README.md README_EN.md`

Expected: reciprocal links, one copy of each media target per file, matching sections, and equivalent limitations.

Run: `git diff --check`

Expected: no output and exit code 0.

- [x] **Step 4: Commit**

```bash
git add README.md README_EN.md docs/superpowers/plans/2026-08-05-readme-bilingual-evalhub-style.md
git commit -m "docs: add bilingual EvalHub-style README"
```
