"use client";

import { useChat } from "@ai-sdk/react";
import { UIMessage, CreateUIMessage, generateId } from "ai";
import { useState, useCallback, useEffect } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { ChatUIMessage } from "@/types/chat-message";

import { ConciergeIcon } from "./icons";
import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const { 
    messages = [], 
    sendMessage,
    stop,
    status,
    error
  } = useChat<ChatUIMessage>({
    id,
    onFinish: () => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, "", `/chat/${id}`);
      }
    },
    onError: (error) => {
      console.error('[CLIENT] Chat error:', error);
    }
  });

  // Manage input state locally since new useChat doesn't provide it
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<any>>([]);
  const [currentSelections, setCurrentSelections] = useState<string>("");

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const isLoading = status === 'streaming' || status === 'submitted';
  
  // Detect if latest assistant message has active choices
  const hasActiveChoices = messages.length > 0 && 
    messages[messages.length - 1]?.role === 'assistant' && 
    messages[messages.length - 1]?.parts?.some((part: any) => part.type === 'data-choices');
  
  // Create handleSubmit that uses sendMessage
  const handleSubmit = useCallback((event?: { preventDefault?: () => void }) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    
    // Combine selections with user input
    const combinedText = currentSelections && input.trim()
      ? `${currentSelections}, ${input}`.trim()
      : currentSelections || input;
    
    if (combinedText.trim() && sendMessage) {
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: combinedText }],
      } as any);
      setInput("");
      setAttachments([]);
      setCurrentSelections(""); // Clear selections after submission
    }
  }, [input, currentSelections, sendMessage]);

  // Function to clear current selections
  const clearSelections = useCallback(() => {
    setCurrentSelections("");
  }, []);

  // Create append function for suggested actions
  const append = useCallback(async (message: UIMessage | CreateUIMessage<UIMessage>) => {
    if (sendMessage) {
      // For UIMessage, extract text from parts
      let textContent = '';
      if ('parts' in message && message.parts) {
        textContent = message.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text || '')
          .join('');
      } else {
        // For CreateUIMessage, check if there's text in parts
        const parts = (message as any).parts || [];
        textContent = parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text || '')
          .join('');
      }
      
      if (textContent) {
        sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: textContent }],
        } as any);
        return generateId(); // Return a message ID
      }
    }
    return null;
  }, [sendMessage]);

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages && messages.length === 0 && <Overview append={append} />}

          {messages && messages.map((message, idx) => {
            if (!message) return null;
            
            // Log first assistant message for debugging
            if (idx === messages.length - 1 && message.role === 'assistant') {
              console.log('[CLIENT] Latest assistant message parts:', message.parts);
            }
            
            // Extract text content from parts
            let content = '';
            if (message.parts && Array.isArray(message.parts)) {
              content = message.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text || '')
                .join('');
            }
            
            // Extract choices data from message parts using proper AI SDK pattern
            const choicesDataPart = message.parts?.find(
              (part: any) => part.type === 'data-choices'
            ) as any;
            const choicesData = choicesDataPart?.data;
            
            
            return (
              <PreviewMessage
                key={message.id || Math.random().toString()}
                chatId={id}
                role={message.role || 'user'}
                content={content}
                attachments={[]}
                toolInvocations={[]}
                choicesData={choicesData}
                onStructuredResponse={(response) => {
                  // Handle structured response by sending it as a new message
                  const responseText = JSON.stringify(response);
                  append({
                    role: 'user',
                    parts: [{ type: 'text', text: `My response: ${responseText}` }]
                  });
                }}
                onChoiceSelection={(text: string) => {
                  // Store choice selections separately from user input
                  setCurrentSelections(text);
                }}
              />
            );
          })}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20">
              <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
                <ConciergeIcon />
              </div>
              <div className="bg-muted rounded-lg p-3 text-zinc-500 flex items-center gap-1">
                <span className="text-sm">Your concierge is preparing a response</span>
                <span className="typing-dots">
                  <span className="dot">•</span>
                  <span className="dot">•</span>
                  <span className="dot">•</span>
                </span>
              </div>
            </div>
          )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px)] px-4 md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
            currentSelections={currentSelections}
            hasChoices={hasActiveChoices}
            clearSelections={clearSelections}
          />
        </form>
      </div>
    </div>
  );
}
