import { UIMessage, streamText, streamObject, generateText, generateObject, createUIMessageStream, createUIMessageStreamResponse } from "ai";

import { geminiModel } from "@/ai";
import { auth } from "@/app/auth-stub";
import {
  deleteChatById,
  getChatById,
  saveChat,
} from "@/db/queries-stub";
import { getConfig } from "@/lib/config/get-config";
import { getFileManager } from "@/lib/config-file-upload";
import { PromptLoader } from "@/lib/config/prompt-loader";
import { parseRetryDelay, isQuotaError, sleepWithProgress, formatRemainingTime } from "@/lib/retry-utils";
import { AssistantResponseSchema } from "@/lib/schemas";
import { generateUUID } from "@/lib/utils";
import { getSystemPrompt, getVerbierContentOnly, getPersonalizationFramework } from "@/prompts/verbier-system-prompt";
import { ChatUIMessage } from "@/types/chat-message";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const maxDuration = 150; // Extended for retry logic (up to 2.5 minutes)

// Initialize file manager (singleton)
let fileInitialized = false;
let fileUri: string | null = null;

interface ChatRequest {
  id: string;
  messages: Array<UIMessage>;
}

export async function POST(request: Request) {
  // Declare variables outside try block for access in catch block
  let totalRequestSize = 0;
  let startTime = Date.now();
  let id = 'unknown';
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`[REQUEST ${requestId}] New API request started`);
  
  try {
    const requestData: ChatRequest = await request.json();
    id = requestData.id;
    const messages = requestData.messages;

    const session = await auth();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }


  // Ensure messages is an array and normalize format for AI SDK 5.x
  const messagesArray = Array.isArray(messages) ? messages : [];
  const normalizedMessages = messagesArray
    .filter((message: UIMessage) => {
      if (!message || !message.parts) return false;
      
      // Check if message has text content
      return message.parts.some(part => 
        part.type === 'text' && part.text?.trim()
      );
    })
    .map(message => {
      // Extract text content from parts
      const textContent = message.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text || '')
        .join('');
      
      return {
        role: message.role || 'user',
        content: textContent
      };
    });

  // Load configuration
  const config = getConfig();
  const promptLoader = new PromptLoader(config);
  
  // Initialize file upload on first request (if configured)
  if (!fileInitialized && config.ai.context.uploadStrategy === 'google-files-api') {
    try {
      const fileManager = getFileManager(config);
      fileUri = await fileManager.getOrUploadContent();
      fileInitialized = true;
      
      if (!fileUri) {
        // File upload failed - falling back to inline content
        console.log('File upload failed, using inline content');
      } else {
        // File ready - token usage reduced by 98%
        console.log('Using uploaded file for content');
      }
    } catch (error) {
      // File upload error - continuing without file upload
      console.error('File upload error:', error);
      // Continue without file upload
    }
  }

  // 1. Token size tracking
  const personalizationFramework = promptLoader.getPersonalizationFramework();
  const systemPrompt = promptLoader.getSystemPrompt();
  const dataContent = promptLoader.getDataContent();
  
  const systemPromptSize = fileUri && personalizationFramework ? personalizationFramework.length : systemPrompt.length;
  const messagesSize = JSON.stringify(normalizedMessages).length;
  const contentSize = fileUri ? 0 : (dataContent?.length || 0);
  totalRequestSize = messagesSize + systemPromptSize + contentSize;
  // Request size tracking for monitoring

  // 5. File effectiveness
  // File effectiveness tracking

  // Try to generate a structured response for all non-trivial messages
  const lastUserMessage = normalizedMessages[normalizedMessages.length - 1]?.content || '';
  
  if (lastUserMessage.trim().length > 0) {  // Skip only for empty inputs
    console.log(`[REQUEST ${requestId}] Attempting streamObject for: "${lastUserMessage.substring(0, 50)}..."`);
    try {
      // Prepare messages with file reference if available
      const messagesForAI = fileUri ? [
        {
          role: 'system' as const,
          content: `${getPersonalizationFramework()}\n\n[Verbier Festival Data: ${fileUri}]`
        },
        ...normalizedMessages
      ] : normalizedMessages;
      
      // Manual transformation to UI stream with retry logic
      const uiStream = createUIMessageStream<ChatUIMessage>({
        execute: async ({ writer }) => {
          console.log(`[REQUEST ${requestId}] Creating UI stream with retry logic`);
          
          let retryCount = 0;
          const maxRetries = 2;
          
          // Retry loop for quota errors
          while (retryCount < maxRetries) {
            // State variables for this attempt
            let quotaError: any = null;
            let recommendedRetryDelay = 0;
            let streamFailed = false;
            let textStarted = false;
            const textId = generateUUID();
            
            console.log(`[REQUEST ${requestId}] StreamObject attempt ${retryCount + 1}/${maxRetries}`);
            
            // Create the streamObject call with error callback
            const result = await streamObject({
              model: geminiModel,  // Use free experimental model
              schema: AssistantResponseSchema,
              messages: messagesForAI,
              // Only include full system prompt if file upload failed
              ...(fileUri ? {} : { system: getSystemPrompt() }),
              temperature: 0.1,  // Low temperature for stable structured output
              maxOutputTokens: 4096,  // Increased limit for complex program responses
              maxRetries: 0,  // We handle retries ourselves
              onError: (event) => {
                // This callback is called when streaming errors occur
                const error = event.error;
                console.error(`[REQUEST ${requestId}] onError callback triggered:`, error);
                
                if (isQuotaError(error)) {
                  console.log(`[REQUEST ${requestId}] Quota error detected in onError callback`);
                  quotaError = error;
                  recommendedRetryDelay = parseRetryDelay(error);
                  streamFailed = true;
                  console.log(`[REQUEST ${requestId}] Recommended retry delay: ${recommendedRetryDelay}ms (${Math.round(recommendedRetryDelay/1000)}s)`);
                } else {
                  console.error(`[REQUEST ${requestId}] Non-quota error in onError:`, (error as any)?.message || error);
                  streamFailed = true;
                }
              },
              onFinish: ({ object, error }) => {
                // Log completion status
                if (error) {
                  console.error(`[REQUEST ${requestId}] Stream finished with error:`, error);
                  if (isQuotaError(error)) {
                    quotaError = error;
                    recommendedRetryDelay = parseRetryDelay(error);
                    streamFailed = true;
                  }
                } else if (object) {
                  console.log(`[REQUEST ${requestId}] Stream completed successfully:`, {
                    hasText: !!object?.text,
                    textPreview: object?.text?.substring(0, 100),
                    hasChoices: !!object?.choices,
                    choicesCount: object?.choices?.options?.length
                  });
                }
              }
            });
            
            console.log(`[REQUEST ${requestId}] StreamObject result obtained, starting stream consumption`);
            
            // Get the partial stream and final object
            const { partialObjectStream, object: objectPromise } = result;
            
            // Track text streaming
            let lastText = '';
            
            // Stream partial updates (won't throw errors, they go to onError)
            for await (const partialObject of partialObjectStream) {
              // Stream text deltas
              if (partialObject.text && partialObject.text !== lastText) {
                const delta = partialObject.text.substring(lastText.length);
                
                if (!textStarted) {
                  console.log(`[REQUEST ${requestId}] Starting text stream`);
                  writer.write({
                    type: 'text-start',
                    id: textId
                  });
                  textStarted = true;
                }
                
                writer.write({
                  type: 'text-delta',
                  id: textId,
                  delta: delta
                });
                
                lastText = partialObject.text;
              }
            }
            
            console.log(`[REQUEST ${requestId}] Stream iteration completed, streamFailed: ${streamFailed}`);
            
            // Check if we had a quota error
            if (streamFailed && quotaError) {
              // End any open text stream
              if (textStarted) {
                writer.write({ type: 'text-end', id: textId });
                textStarted = false;
              }
              
              retryCount++;
              
              // If we've exhausted retries, send final message
              if (retryCount >= maxRetries) {
                console.log(`[REQUEST ${requestId}] Exhausted retries after ${retryCount} attempts`);
                
                const errorId = generateUUID();
                writer.write({ type: 'text-start', id: errorId });
                writer.write({
                  type: 'text-delta',
                  id: errorId,
                  delta: "The Festival Concierge is experiencing exceptional demand. Please try again in a few minutes. We apologize for the inconvenience."
                });
                writer.write({ type: 'text-end', id: errorId });
                break; // Exit retry loop
              }
              
              // We have retries left, wait and try again
              console.log(`[REQUEST ${requestId}] Starting retry ${retryCount}/${maxRetries} with ${recommendedRetryDelay}ms delay`);
              
              // Send waiting message
              const waitingId = generateUUID();
              writer.write({ type: 'text-start', id: waitingId });
              
              const attemptMessage = retryCount === 1 
                ? `High demand detected. Waiting ${formatRemainingTime(recommendedRetryDelay)} as recommended by the service...`
                : `Service is still busy. Waiting ${formatRemainingTime(recommendedRetryDelay)} before trying once more...`;
              
              writer.write({
                type: 'text-delta',
                id: waitingId,
                delta: attemptMessage
              });
              
              // Sleep with progress updates
              await sleepWithProgress(
                recommendedRetryDelay,
                (remainingMs) => {
                  if (remainingMs > 5000) { // Only show updates if more than 5 seconds remain
                    writer.write({
                      type: 'text-delta',
                      id: waitingId,
                      delta: `\n${formatRemainingTime(remainingMs)} remaining...`
                    });
                  }
                },
                10000 // Update every 10 seconds
              );
              
              // End waiting message
              writer.write({ type: 'text-end', id: waitingId });
              
              console.log(`[REQUEST ${requestId}] Wait complete, attempting retry ${retryCount}/${maxRetries}`);
              
              // Continue to next retry attempt
              continue;
              
            } else if (streamFailed && !quotaError) {
              // Non-quota error, send error message and exit
              if (textStarted) {
                writer.write({ type: 'text-end', id: textId });
                textStarted = false;
              }
              
              console.error(`[REQUEST ${requestId}] Non-quota error, sending error message`);
              const errorId = generateUUID();
              writer.write({ type: 'text-start', id: errorId });
              writer.write({
                type: 'text-delta',
                id: errorId,
                delta: "I apologize, but I encountered an error processing your request. Please try again."
              });
              writer.write({ type: 'text-end', id: errorId });
              break;
            }
            
            // No error - process the successful response
            console.log(`[REQUEST ${requestId}] Stream succeeded, processing final object`);
            
            // End text stream if still open
            if (textStarted) {
              writer.write({
                type: 'text-end',
                id: textId
              });
              console.log(`[REQUEST ${requestId}] Text stream completed`);
            }
            
            // Wait for the final object
            const finalObject = await objectPromise;
            
            // Send choices as data part if present
            if (finalObject?.choices) {
              console.log(`[REQUEST ${requestId}] Writing choices data:`, {
                multipleChoice: finalObject.choices.multiple_choice,
                optionsCount: finalObject.choices.options.length
              });
              
              writer.write({
                type: 'data-choices',
                id: generateUUID(),
                data: {
                  ...finalObject.choices,
                  status: 'ready' as const
                }
              });
            }
            
            // Success - break out of retry loop
            console.log(`[REQUEST ${requestId}] Response completed successfully`);
            break;
          }
        }
      });
      
      console.log(`[REQUEST ${requestId}] Returning UI stream response`);
      return createUIMessageStreamResponse({ stream: uiStream });
      
    } catch (error: any) {
      console.error(`[REQUEST ${requestId}] StreamObject failed:`, error.message || error);
      // Fall through to regular text generation
    }
  }

  console.log(`[REQUEST ${requestId}] Using regular text generation`);

  // 3. Reset timing for actual request
  startTime = Date.now();

  // Prepare messages with file reference
  // When using file upload, we include the file URI in the system message
  // and keep user messages as simple strings for compatibility
  const messagesForAI = fileUri ? [
    {
      role: 'system' as const,
      content: `${getPersonalizationFramework()}\n\n[Verbier Festival Data: ${fileUri}]`
    },
    ...normalizedMessages
  ] : normalizedMessages;

  // Create UI stream with retry logic for regular text generation
  const uiStream = createUIMessageStream<ChatUIMessage>({
    execute: async ({ writer }) => {
      console.log(`[REQUEST ${requestId}] Creating text stream with retry logic`);
      
      let retryCount = 0;
      const maxRetries = 2;
      const textId = generateUUID();
      let textStarted = false;
      
      while (retryCount < maxRetries) {
        try {
          // Prepare streaming configuration
          const streamConfig: any = {
            model: geminiModel,
            messages: messagesForAI,
            // Only include full system prompt if file upload failed
            ...(fileUri ? {} : { system: getSystemPrompt() }),
            // Don't let SDK retry - we handle it ourselves
            maxRetries: 0,
            // Festival-specific tools can be added here when needed
            onFinish: async () => {
              if (session.user && session.user.id) {
                try {
                  // Save the normalized messages
                  await saveChat({
                    id,
                    messages: normalizedMessages,
                    userId: session.user.id,
                  });
                } catch (error) {
                  // Failed to save chat
                }
              }
            },
            experimental_telemetry: {
              isEnabled: true,
              functionId: "stream-text",
            },
          };

          const result = await streamText(streamConfig);
          
          // Stream the text response
          if (!textStarted) {
            writer.write({ type: 'text-start', id: textId });
            textStarted = true;
          }
          
          for await (const chunk of result.textStream) {
            writer.write({
              type: 'text-delta',
              id: textId,
              delta: chunk
            });
          }
          
          writer.write({ type: 'text-end', id: textId });
          
          console.log(`[REQUEST ${requestId}] [REGULAR] Text streaming completed`);
          break; // Success - exit retry loop
          
        } catch (error: any) {
          console.error(`[REQUEST ${requestId}] Text generation error (attempt ${retryCount + 1}):`, error.message);
          
          // Check if it's a quota error
          if (isQuotaError(error)) {
            retryCount++;
            
            // If we've exhausted retries, send final message
            if (retryCount >= maxRetries) {
              console.log(`[REQUEST ${requestId}] Exhausted retries after ${retryCount} attempts`);
              
              if (!textStarted) {
                writer.write({ type: 'text-start', id: textId });
                textStarted = true;
              }
              writer.write({
                type: 'text-delta',
                id: textId,
                delta: "The Festival Concierge is experiencing exceptional demand. Please try again in a few minutes. We apologize for the inconvenience."
              });
              writer.write({ type: 'text-end', id: textId });
              return; // Exit gracefully
            }
            
            // Parse retry delay from error
            const retryDelay = parseRetryDelay(error);
            console.log(`[REQUEST ${requestId}] Google recommends retry after ${retryDelay}ms (${Math.round(retryDelay/1000)}s)`);
            console.log(`[REQUEST ${requestId}] Starting retry ${retryCount}/${maxRetries} with ${retryDelay}ms delay`);
            
            // Send waiting message
            if (!textStarted) {
              writer.write({ type: 'text-start', id: textId });
              textStarted = true;
            }
            
            const attemptMessage = retryCount === 1 
              ? `High demand detected. Waiting ${formatRemainingTime(retryDelay)} as recommended by the service...`
              : `Service is still busy. Waiting ${formatRemainingTime(retryDelay)} before trying once more...`;
            
            writer.write({
              type: 'text-delta',
              id: textId,
              delta: attemptMessage
            });
            
            // Sleep with progress updates
            await sleepWithProgress(
              retryDelay,
              (remainingMs) => {
                if (remainingMs > 5000) { // Only show updates if more than 5 seconds remain
                  writer.write({
                    type: 'text-delta',
                    id: textId,
                    delta: `\n${formatRemainingTime(remainingMs)} remaining...`
                  });
                }
              },
              10000 // Update every 10 seconds
            );
            
            // Clear the waiting message and prepare for retry
            writer.write({ type: 'text-end', id: textId });
            textStarted = false;
            
            console.log(`[REQUEST ${requestId}] Wait complete, attempting retry ${retryCount}/${maxRetries}`);
            
            // Continue to next retry attempt
            continue;
          }
          
          // Not a quota error - throw it
          throw error;
        }
      }
    }
  });
  
  console.log(`[REQUEST ${requestId}] [REGULAR] Returning UI stream response`);
  return createUIMessageStreamResponse({ stream: uiStream });
  } catch (error: any) {
    // Chat API Error
    
    // 4. Quota error detection
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      // Quota limit exceeded
    }
    
    // 2. Retry detection
    if (error.errors?.length > 0 || error.reason === 'maxRetriesExceeded') {
      // Failed after retries
    }
    
    // 3. Log final timing even on error
    // Error response timing
    
    // Return more specific error information
    // Handle quota errors specifically
    if (error.message?.includes('quota') || error.message?.includes('429') || error.statusCode === 429) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded', 
        message: 'You\'ve exceeded the API rate limit. Please wait a minute before trying again.',
        retryAfter: 60 // seconds
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
