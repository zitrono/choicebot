#!/bin/bash

# Verbier Festival Chatbot - Complete Build Script
# Run this script to create the entire chatbot in one go!

echo "🚀 Building Verbier Festival Chatbot..."

# Step 1: Create Next.js project
echo "📦 Creating Next.js project..."
npx create-next-app@latest verbier-chatbot \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm

cd verbier-chatbot

# Step 2: Install AI dependencies
echo "📦 Installing AI SDK..."
npm install ai @ai-sdk/google

# Step 3: Create environment file
echo "🔑 Creating .env.local..."
cat > .env.local << 'EOF'
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
EOF

# Step 4: Copy verbier.txt
echo "📄 Copying Verbier context..."
cp ../verbier.txt ./verbier.txt

# Step 5: Create API route
echo "🛠️ Creating API route..."
mkdir -p app/api/chat
cat > app/api/chat/route.ts << 'EOF'
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load Verbier context
const verbierText = readFileSync(join(process.cwd(), 'verbier.txt'), 'utf-8');
const SYSTEM_PROMPT = `You are a helpful assistant for the Verbier Festival 2025.
You have access to the complete festival program and information.
Context: ${verbierText.substring(0, 100000)}
Be friendly, accurate, and helpful. Format responses with markdown when appropriate.`;

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
EOF

# Step 6: Create chat UI
echo "🎨 Creating chat interface..."
cat > app/page.tsx << 'EOF'
'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">
          🎼 Verbier Festival 2025 Assistant
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Ask me about concerts, artists, schedules, and more!
        </p>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-8">How can I help you today?</p>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {[
                  '📅 Festival dates?',
                  '🎭 Who is performing?',
                  '🎫 Ticket information',
                  '📍 Venue details'
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      const input = document.querySelector('input') as HTMLInputElement;
                      if (input) {
                        input.value = prompt;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                    className="p-3 text-left bg-white rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white shadow-md text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-white p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about the Verbier Festival..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
EOF

# Step 7: Update layout for better styling
echo "🎨 Updating layout..."
cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Verbier Festival 2025 Assistant",
  description: "AI-powered assistant for the Verbier Festival",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
EOF

echo "✅ Build complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your Gemini API key to verbier-chatbot/.env.local"
echo "2. cd verbier-chatbot"
echo "3. npm run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "🚀 To deploy to Vercel:"
echo "   vercel --prod"