# Visitor-first README design

## Goal

Make the root README explain the working TypeScript demo, show the existing video early, and help
a visitor run the Agent and RAG entry points without reading six diagrams first.

## Scope

- Keep the README in English.
- Preserve the existing YouTube thumbnail, YouTube target, and concept-image URLs exactly.
- Shorten repeated bilingual/conceptual material and keep one overall architecture diagram.
- Link to `architecture-diagram.md` for the detailed design.

## Visitor flow

1. Project name, accurate experimental-project positioning, and verified badges.
2. Three current demonstrations: OpenAI-compatible chat, MCP tool calls, and MongoDB-backed
   knowledge/embedding management.
3. Existing YouTube thumbnail linked to the existing video.
4. Current scope and limitations, including that Agent chat and RAG retrieval are separate paths.
5. Quick Start with Node, pnpm, MongoDB, model endpoints, environment variables, and ports.
6. Entry-point guide for `/`, `/admin`, and `/admin/rag`.
7. One overall architecture diagram, followed by the existing concept image.
8. Detailed architecture link, MCP references, and contribution guidance.

## Media contract

The following URLs must remain unchanged:

- Thumbnail: `https://img.youtube.com/vi/bXcvtlj1xRg/0.jpg`
- Video: `https://www.youtube.com/watch?v=bXcvtlj1xRg`
- Concept image: `https://raw.githubusercontent.com/NEDONION/my-pics-space/main/20250717172938.png`

## Accuracy rules

- Say the implementation avoids LangChain and LlamaIndex; do not call it dependency-free.
- Do not claim that MCP performs model inference or that tool calls run in parallel.
- Do not imply that the web chat currently performs integrated document Q&A.
- Do not claim file upload, a frontend vector engine, production readiness, auth, queues, or a
  dedicated vector database.
- State that `pnpm run dev` is a RAG smoke-test path, not the complete application launcher.

## Validation

- Compare the thumbnail, video target, and concept-image URLs before and after the rewrite.
- Check all documented scripts, paths, ports, and environment keys against repository files.
- Check relative links and fenced code blocks, then run `git diff --check`.
- Inspect the final diff for claims that merge the separate Agent and RAG flows.

## Acceptance criteria

A visitor should see the demo video and current capabilities before implementation detail, then
reach an accurate Quick Start quickly. The original video and concept image remain unchanged.
