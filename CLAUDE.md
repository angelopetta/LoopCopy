# CLAUDE.md

## Project Overview

LoopCopy is an AI-powered elite copywriting engine built with React + TypeScript + Tailwind CSS, using the Claude API (Anthropic) for AI generation. It features a "Black Box + Loop" system: users configure 15 copywriting parameters, then iteratively generate and refine copy with streaming feedback.

## Commands

- `npm run dev` — Start dev server (port 3000, serves both React app and API)
- `npm run build` — Production build
- `npm run lint` — TypeScript type checking (`tsc --noEmit`)
- `npm run clean` — Remove dist/

## Architecture

### Backend (`server/`)
- Express server mounted as Vite dev middleware (same port, no CORS)
- `server/routes/ai.ts` — Three endpoints: `/api/analyze`, `/api/generate` (SSE streaming), `/api/suggest-more`
- `server/services/claude.ts` — Anthropic SDK wrapper; uses `tool_use` for structured output, `messages.stream()` for copy generation
- API key (`ANTHROPIC_API_KEY`) stays server-side only, never in client bundle

### Frontend (`src/`)
- `src/App.tsx` — Thin shell: providers + phase routing
- `src/types/index.ts` — All TypeScript interfaces, parameter definitions, content templates
- `src/context/SessionContext.tsx` — `useReducer` + Context for all app state
- `src/hooks/useAI.ts` — API calls to `/api/*` endpoints with SSE stream consumption
- `src/hooks/usePersistence.ts` — localStorage auto-save/restore
- `src/hooks/useExport.ts` — Export to clipboard/markdown/JSON
- `src/components/phase1/` — Brand seed input, parameter configurator
- `src/components/phase2/` — Workspace: sidebar, concept input, output pane, version history, feedback bar, version compare
- `src/components/shared/` — ErrorBanner, LoadingOverlay, PillButton, ExportMenu

### Key Patterns
- State managed via single `useReducer` in `SessionContext` — never use scattered `useState` for app state
- All AI calls go through `useAI` hook → server proxy → Anthropic SDK (never call Claude from client)
- Streaming uses SSE: server sends `data: {"type":"text","text":"..."}` events
- 15 Black Box parameters split into "Strategy" (what to say) and "Craft" (how to say it) groups
- Parameter tooltips defined in `ParamCategory.tsx` TOOLTIPS constant

## Style Guide

- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Color scheme: slate for base, indigo for accents, dark sidebar (slate-900)
- Font: Inter (loaded from Google Fonts in index.html)
- Icons: lucide-react
- Animations: motion (framer motion) for phase transitions
- Components use `.js` extensions in imports (ESM)

## Environment

- Requires `ANTHROPIC_API_KEY` in `.env` file (see `.env.example`)
- Claude model: `claude-sonnet-4-20250514` (configured in `server/services/claude.ts`)
