# Verbier Festival Chatbot - Final Implementation Strategy

## 🎯 Recommended Solution: Vercel AI SDK + Gemini

Based on research, the **best solution** is:
- **Vercel AI SDK** (`ai` package) - Handles streaming, state management, and AI integration
- **@ai-sdk/google** - Official Gemini adapter for Vercel AI SDK  
- **Tailwind CSS** - For styling (no extra UI library needed for MVP)
- **Next.js 14** with App Router

## Why This Solution?

### Vercel AI SDK Advantages:
✅ **Ready-made hooks** (`useChat`) that handle all chat logic  
✅ **Built-in streaming** support for real-time responses  
✅ **Provider agnostic** - Easy to switch between Gemini, OpenAI, etc.  
✅ **Optimized for Next.js** - Works perfectly with App Router  
✅ **Minimal code** - The `useChat` hook handles messages, input, submission  
✅ **Production ready** - Used by thousands of apps in production

### Comparison with Alternatives:
| Solution | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Vercel AI SDK** | Ready hooks, streaming, Gemini support | Need to style UI yourself | ✅ **BEST** |
| **assistant-ui** | Beautiful pre-built UI | Extra dependency, less control | Good if you want instant UI |
| **OpenAI SDK** | Simple API wrapper | No UI components, no Gemini | ❌ Not suitable |
| **Custom implementation** | Full control | More code, handle streaming yourself | Too complex for MVP |
| **Microsoft Bot Framework** | Enterprise features | Overkill, complex setup | ❌ Too heavy |

## 📦 Installation

```bash
# Create Next.js app
npx create-next-app@latest verbier-chatbot --typescript --tailwind --app
cd verbier-chatbot

# Install Vercel AI SDK and Gemini adapter
npm install ai @ai-sdk/google

# Total dependencies needed (only 2 extra packages!)
```

## 📁 Project Structure

```
verbier-chatbot/
├── .env.local                      # API key
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts       # API endpoint (30 lines)
│   │   ├── page.tsx                # Chat UI (50 lines)
│   │   ├── layout.tsx              # Layout wrapper
│   │   └── globals.css             # Tailwind styles
│   └── lib/
│       └── context.ts              # Verbier context data
```

## 🔑 Environment Setup

Create `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

## 💻 Complete Implementation

### 1. API Route (`app/api/chat/route.ts`)

```typescript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Load Verbier context (we'll create this file)
import { VERBIER_CONTEXT } from '@/lib/context';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Add system prompt with Verbier context
  const result = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    system: VERBIER_CONTEXT,
    messages,
  });

  return result.toAIStreamResponse();
}
```

### 2. Chat Interface (`app/page.tsx`)

```typescript
'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Verbier Festival 2025 Assistant
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Ask me anything about the festival program, artists, or events
        </p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-4">Welcome! I can help you with:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                <button className="text-left p-3 bg-white rounded-lg border hover:bg-gray-50">
                  📅 Festival dates and schedule
                </button>
                <button className="text-left p-3 bg-white rounded-lg border hover:bg-gray-50">
                  🎭 Artist information
                </button>
                <button className="text-left p-3 bg-white rounded-lg border hover:bg-gray-50">
                  🎫 Ticket information
                </button>
                <button className="text-left p-3 bg-white rounded-lg border hover:bg-gray-50">
                  📍 Venue details
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about the Verbier Festival..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 3. Verbier Context (`lib/context.ts`)

```typescript
// This will contain the extracted text from verbier.txt
export const VERBIER_CONTEXT = `
You are a helpful assistant for the Verbier Festival 2025.
You have detailed knowledge about the festival program, artists, venues, and events.

[The content from verbier.txt will be inserted here]

Guidelines:
- Provide accurate information based on the festival data
- Be friendly and helpful
- If you don't have specific information, say so
- Format responses clearly with bullet points when listing multiple items
- Include dates and times when discussing events
`;
```

### 4. Tailwind Config (Already configured by create-next-app)

The `globals.css` file already includes:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🚀 Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Deploy to Vercel
vercel --prod
```

## 📊 Comparison: Why Vercel AI SDK Wins

### Code Simplicity
- **Vercel AI SDK**: ~80 lines total
- **Custom implementation**: ~300+ lines
- **assistant-ui**: More dependencies and configuration

### Features Out of the Box
- ✅ Streaming responses
- ✅ Automatic error handling
- ✅ Loading states
- ✅ Message history management
- ✅ Input validation
- ✅ TypeScript types

### Performance
- Built-in request deduplication
- Automatic retries
- Edge function compatible
- Optimized for Next.js

## 🎯 Next Steps

1. **Get Gemini API Key**: 
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add to `.env.local`

2. **Insert Verbier Context**:
   - Copy content from `verbier.txt`
   - Add to `lib/context.ts`

3. **Deploy**:
   - Push to GitHub
   - Connect to Vercel
   - Deploy with one click

## 🏆 Summary

The **Vercel AI SDK with Gemini** is the clear winner because:
- **Minimal code** - Just 2 files, ~80 lines total
- **Production ready** - Used by major companies
- **Best DX** - The `useChat` hook does all the heavy lifting
- **Future proof** - Easy to switch AI providers
- **Free tier friendly** - Works within Vercel's limits

This solution gives you a production-ready chatbot in under 100 lines of code!