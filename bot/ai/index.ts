import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Create Google AI instance with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
});

// Define both model variants
// Experimental: Free tier with 250 requests/day limit
export const geminiFlashExperimental = google("gemini-2.5-flash-preview-05-20");

// Stable: Paid version with no daily limits
// Pricing: $0.30 per 1M input tokens, $2.50 per 1M output tokens
export const geminiFlashStable = google("gemini-2.5-flash");

// Select model based on environment variable
// Set USE_EXPERIMENTAL_GEMINI=true to use free experimental model (for development)
// Leave unset or false to use paid stable model (for production)
const useExperimentalModel = process.env.USE_EXPERIMENTAL_GEMINI === 'true';

// Export the selected model as the default
export const geminiModel = useExperimentalModel 
  ? geminiFlashExperimental 
  : geminiFlashStable;

// Log which model is being used (for debugging)
if (process.env.NODE_ENV !== 'production') {
  console.log(`[AI] Using ${useExperimentalModel ? 'experimental (free)' : 'stable (paid)'} Gemini 2.5 Flash model`);
}
