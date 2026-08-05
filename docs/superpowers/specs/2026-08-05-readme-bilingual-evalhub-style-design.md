# Bilingual EvalHub-style README design

## Goal

Make Chinese the default visitor experience and add a complete English version, using EvalHub's
centered structure while treating the existing YouTube demo as the primary visual proof.

## Files

- `README.md`: Chinese primary version shown by GitHub.
- `README_EN.md`: complete English version.
- Both files use a prominent centered `简体中文 · English` switch.

## Shared layout

Both versions follow the same section order:

1. Centered name, memorable value proposition, language switch, verified badges, and anchor nav.
2. Concise scope explanation followed by the existing linked YouTube thumbnail and caption.
3. Four-row capability table covering chat, MCP tools, knowledge management, and retrieval.
4. Honest current-scope notice followed by Quick Start.
5. Entry-point table, one Mermaid architecture overview, and the existing concept image.
6. Known limitations, scripts, references, and contributing.

## Positioning

Chinese headline: `不用 LangChain 或 LlamaIndex，从代码拆解 Agent、MCP 与 RAG。`

The README must keep Agent/MCP chat and RAG retrieval explicitly separate. It must document the
current `gpt-4` model-ID and `uv` requirements, and it must not present the legacy `dev` entry point
or legacy architecture document as working guidance.

## Media contract

Each version must retain these URLs exactly once:

- Thumbnail: `https://img.youtube.com/vi/bXcvtlj1xRg/0.jpg`
- Video target: `https://www.youtube.com/watch?v=bXcvtlj1xRg`
- Concept image: `https://raw.githubusercontent.com/NEDONION/my-pics-space/main/20250717172938.png`

## Validation

- Compare exact thumbnail, video-target, and concept-image counts in both files.
- Verify language switches, anchor links, routes, environment keys, and balanced fences.
- Confirm both versions use one Mermaid diagram and equivalent scope/limitation language.
- Run `git diff --check` and scan for integrated Agent/RAG or working legacy-entry claims.

## Acceptance criteria

The Chinese root README must show the demo immediately, explain the three real learning paths, and
make the current boundaries easy to trust. English must be one obvious click away and equally
complete.
