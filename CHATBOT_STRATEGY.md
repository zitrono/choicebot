# Verbier Festival Chatbot - Implementation Strategy

## Tech Stack
- **Next.js 14.2.3** with App Router
- **TypeScript 5.4.5**
- **@google/generative-ai 0.11.3** for Gemini Flash API
- **Tailwind CSS** for styling
- **Vercel** for deployment

## Architecture

### 1. Project Setup
```bash
npx create-next-app@latest verbier-chatbot --typescript --tailwind --app
cd verbier-chatbot
npm install @google/generative-ai
```

### 2. Folder Structure
```
verbier-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts         # API endpoint for Gemini
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx    # Main chat UI component
│   │   │   ├── MessageList.tsx      # Display messages
│   │   │   └── MessageInput.tsx     # Input field component
│   │   ├── lib/
│   │   │   └── gemini.ts           # Gemini client setup
│   │   ├── types/
│   │   │   └── chat.ts             # TypeScript interfaces
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                # Main page with chat
│   └── data/
│       └── verbier-context.ts      # System prompt with festival data
├── .env.local                      # GEMINI_API_KEY
└── package.json
```

### 3. Core Components

#### API Route (`/api/chat/route.ts`)
- Receives messages array from client
- Adds system prompt with Verbier context
- Calls Gemini Flash API
- Streams response back to client

#### Chat Interface
- **State Management**: React useState for messages
- **Message History**: Client-side array storage
- **Auto-scroll**: To latest message
- **Loading States**: While waiting for response

### 4. System Prompt Strategy
```typescript
const SYSTEM_PROMPT = `
You are a helpful assistant for the Verbier Festival 2025.
You have detailed knowledge about:
${verbierTextContent}

Additional context:
${additionalContext}

Please provide accurate, helpful information about the festival.
`;
```

### 5. Memory Management
- **Client-side**: Store conversation in React state
- **Server-side**: Stateless, receives full history each request
- **Optimization**: Limit to last 10-15 messages to stay within token limits

### 6. Implementation Steps

1. **Initialize Next.js project**
2. **Set up Gemini API client**
3. **Create API route for chat**
4. **Build chat UI components**
5. **Integrate Verbier context**
6. **Add streaming support**
7. **Deploy to Vercel**

### 7. Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
```

### 8. Key Features
- Real-time streaming responses
- Markdown support in messages
- Copy message functionality
- Clear conversation button
- Responsive mobile design
- Dark/light mode support

### 9. Deployment
```bash
# Build and test locally
npm run build
npm run start

# Deploy to Vercel
vercel --prod
```

## Next Steps
1. Create the Next.js project
2. Implement the API route with Gemini integration
3. Build the chat UI components
4. Integrate the Verbier text data as context
5. Test and deploy

This approach provides:
- **Simplicity**: Minimal dependencies, straightforward architecture
- **Robustness**: TypeScript for type safety, error handling
- **Performance**: Streaming responses, client-side state
- **Flexibility**: Easy to extend with additional features
- **Deployment**: One-click deploy to Vercel