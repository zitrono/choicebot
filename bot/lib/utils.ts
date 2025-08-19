import {
  CoreMessage,
  CoreToolMessage,
  generateId,
  UIMessage,
} from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Chat } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data.",
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<UIMessage>;
}): Array<UIMessage> {
  return messages.map((message) => {
    // Tool invocations are handled differently in the new AI SDK
    // For now, just return the message as-is
    return message;
  });
}

export function convertToUIMessages(
  messages: Array<CoreMessage>,
): Array<UIMessage> {
  if (!messages || !Array.isArray(messages)) {
    return [];
  }
  
  return messages.reduce((chatMessages: Array<UIMessage>, message) => {
    if (!message) return chatMessages;
    
    if (message.role === "tool") {
      // Skip tool messages for now in the UI
      return chatMessages;
    }

    let textContent = "";
    const parts: any[] = [];

    if (typeof message.content === "string") {
      textContent = message.content;
      parts.push({ type: "text", text: message.content });
    } else if (message.content && Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          textContent += content.text || "";
          parts.push({ type: "text", text: content.text || "" });
        } else if (content.type === "tool-call") {
          parts.push({
            type: "tool",
            name: (content as any).toolName,
            id: (content as any).toolCallId,
            parameters: (content as any).args,
          });
        }
      }
    }

    chatMessages.push({
      id: generateId(),
      role: message.role || "user",
      parts,
    } as UIMessage);

    return chatMessages;
  }, []);
}

export function getTitleFromChat(chat: Chat) {
  if (!chat || !chat.messages) {
    return "Untitled";
  }
  
  const messages = chat.messages as Array<UIMessage>;
  const firstMessage = messages && messages.length > 0 ? messages[0] : null;

  if (!firstMessage || !firstMessage.parts) {
    return "Untitled";
  }

  // Extract text from parts
  const textPart = firstMessage.parts.find((part: any) => part.type === 'text');
  if (!textPart || !(textPart as any).text) {
    return "Untitled";
  }

  return (textPart as any).text;
}
