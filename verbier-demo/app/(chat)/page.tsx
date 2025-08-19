import { UIMessage } from "ai";

import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const id = generateUUID();
  
  const welcomeMessage: UIMessage = {
    id: generateUUID(),
    role: 'assistant',
    parts: [{
      type: 'text',
      text: `Welcome to Verbier Festival 2025! 🎼

I'm your Festival Digital Concierge, at your service to curate the perfect classical music experience among our 200+ performances from July 17 to August 3.

How may I assist you today?
• 🎵 Discover concerts matching your musical tastes
• 🌄 Explore unique alpine venue experiences  
• 📅 Create a personalized festival itinerary
• 🎭 Learn about featured artists and programs

Allow me to learn about your preferences and create your ideal festival experience!`
    }]
  };
  
  return <Chat key={id} id={id} initialMessages={[welcomeMessage]} />;
}
