# Quick Start: Build Verbier Chatbot in 5 Minutes

## Step 1: Create Project (1 min)
```bash
npx create-next-app@latest verbier-chatbot --typescript --tailwind --app --no-src-dir
cd verbier-chatbot
npm install ai @ai-sdk/google
```

## Step 2: Add API Key (30 sec)
Create `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

## Step 3: Create API Route (1 min)
Create `app/api/chat/route.ts`:
```typescript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load Verbier context at startup
const verbierText = readFileSync(join(process.cwd(), 'verbier.txt'), 'utf-8');
const SYSTEM_PROMPT = `You are a helpful assistant for the Verbier Festival 2025.
You have detailed knowledge about: ${verbierText}
Be friendly, accurate, and helpful. Format responses clearly.`;

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toAIStreamResponse();
}
```

## Step 4: Create Chat UI (2 min)
Replace `app/page.tsx`:
```typescript
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <h1 className="text-xl font-bold">Verbier Festival Assistant</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-white p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about the festival..."
            className="flex-1 px-3 py-2 border rounded-lg"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

## Step 5: Add Verbier Context (30 sec)
Copy `verbier.txt` to project root

## Step 6: Run! (30 sec)
```bash
npm run dev
```

Open http://localhost:3000

## That's it! 🎉

You now have a working chatbot with:
- ✅ Gemini Flash API integration
- ✅ Streaming responses
- ✅ Full Verbier context
- ✅ Clean UI
- ✅ TypeScript
- ✅ Ready to deploy

## Deploy to Vercel
```bash
vercel --prod
```

## Total Lines of Code: < 70! 🚀