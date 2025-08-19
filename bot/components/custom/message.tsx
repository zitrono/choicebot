"use client";

// import { Attachment, ToolInvocation } from "ai";
// Types are not exported in the new AI SDK version
type Attachment = any;
type ToolInvocation = any;
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { Choice } from "@/lib/schemas/choice.schema";

import { ConciergeIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { StructuredMessage } from "./structured/structured-message";
import { Weather } from "./weather";
import { PillChoiceRenderer } from "../ui/pill-choice-renderer";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  onStructuredResponse,
  onChoiceSelection,
  choicesData,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  onStructuredResponse?: (response: any) => void;
  onChoiceSelection?: (text: string) => void;
  choicesData?: Choice & { status: 'loading' | 'ready' };
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className={`size-[24px] rounded-sm p-1 flex flex-col justify-center items-center shrink-0 ${
        role === "assistant" 
          ? "border text-zinc-500" 
          : "bg-verbier-blue border-verbier-blue text-white"
      }`}>
        {role === "assistant" ? <ConciergeIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {/* Handle regular text content */}
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}
        
        {/* Handle structured choices data directly from data parts */}
        {choicesData && (
          <PillChoiceRenderer
            data={choicesData}
            onChoiceSelect={(text: string) => {
              if (onChoiceSelection) {
                onChoiceSelection(text);
              }
            }}
          />
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : (
                      <div className="p-3 rounded-md bg-muted">
                        <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : (
                      <div className="p-3 rounded-md bg-muted animate-pulse">
                        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
