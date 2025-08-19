# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Verbier Festival AI chatbot built with Next.js 15, React 19 RC, and Google Gemini. It provides personalized festival recommendations using 456KB of Verbier Festival data.

## Development Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Run development server
pnpm dev          # Runs on http://localhost:3000 with --turbo

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Architecture & Key Components

### AI Integration
- **Models**: Uses `gemini-2.5-flash-preview-05-20` as primary model (defined in `/ai/index.ts`)
- **File Upload Strategy**: Uses Google Files API (`GoogleAIFileManager`) to upload Verbier content once and reference by URI, reducing token usage by 98%
- **Token Optimization**: Files persist for 48 hours and survive server restarts
- **Fallback**: If file upload fails, falls back to inline content (but will exhaust free tier quota)

### Critical Files
- `/app/(chat)/api/chat/route.ts` - Main chat API endpoint handling streaming responses and file upload initialization
- `/lib/google-file-upload.ts` - Manages Google Files API uploads and URI persistence
- `/prompts/verbier-system-prompt.ts` - Contains festival data and personalization framework
- `/data/verbier.txt` - 456KB of Verbier Festival content

### Message Format
Messages must be simple strings for Vercel AI SDK compatibility. File references are embedded in system messages:
```typescript
{
  role: 'system',
  content: `${personalizationFramework}\n\n[Verbier Festival Data: ${fileUri}]`
}
```

### Type System
- Uses AI SDK v5.0.2 with `UIMessage` type (not the deprecated `Message` type)
- React 19 RC with updated types for `RefObject` and form actions

## Known Issues & Solutions

### Token Exhaustion
- **Problem**: Free tier has 0 cache storage quota, each request without file upload uses ~116,000 tokens
- **Solution**: Google Files API upload reduces to ~2,000 tokens per request
- **Quota**: Free tier limit is 250,000 tokens/minute

### Development Server
- Port 3000 is often in use, server will automatically use port 3001
- Use `pkill -f "next dev"` to stop orphaned dev servers

## Environment Variables

Required in `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
AUTH_SECRET=your_secret_here
```

## Database
- Uses Vercel Postgres for chat history (stub implementations in development)
- Schema defined in `/db/schema.ts`
- Migrations in `/lib/drizzle/`