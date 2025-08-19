import { UIMessage } from "ai";
import { notFound } from "next/navigation";

import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";
import { getConfig } from "@/lib/config/get-config";

export default async function Page({ params }: { params: { config: string } }) {
  const id = generateUUID();
  const config = getConfig(params.config);
  
  // If config doesn't exist, show 404
  if (!config) {
    notFound();
  }
  
  // Build welcome message from config
  let welcomeText = config.ui.welcomeMessage.title + '\n\n';
  welcomeText += config.ui.welcomeMessage.subtitle + '\n\n';
  welcomeText += config.ui.welcomeMessage.callToAction;
  
  if (config.ui.welcomeMessage.options.length > 0) {
    welcomeText += '\n';
    for (const option of config.ui.welcomeMessage.options) {
      welcomeText += `• ${option}\n`;
    }
  }
  
  if (config.ui.welcomeMessage.closing) {
    welcomeText += '\n' + config.ui.welcomeMessage.closing;
  }
  
  const welcomeMessage: UIMessage = {
    id: generateUUID(),
    role: 'assistant',
    parts: [{
      type: 'text',
      text: welcomeText
    }]
  };
  
  return <Chat key={id} id={id} initialMessages={[welcomeMessage]} configId={params.config} />;
}
