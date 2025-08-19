/**
 * Utility functions for handling Gemini API retries with exponential backoff
 */

/**
 * Parse retry delay from Google API error response
 * Google provides a RetryInfo object with recommended retry delay
 */
export function parseRetryDelay(error: any): number {
  try {
    // Check if error has the expected structure
    if (error?.data?.error?.details) {
      const retryInfo = error.data.error.details.find(
        (detail: any) => detail['@type']?.includes('RetryInfo')
      );
      
      if (retryInfo?.retryDelay) {
        // Parse delay like "47s" to milliseconds
        const match = retryInfo.retryDelay.match(/(\d+)s/);
        if (match) {
          const seconds = parseInt(match[1], 10);
          console.log(`[RETRY] Google recommends retry after ${seconds} seconds`);
          return seconds * 1000;
        }
      }
    }

    // Also check for responseBody if data is not available
    if (error?.responseBody && typeof error.responseBody === 'string') {
      try {
        const parsed = JSON.parse(error.responseBody);
        if (parsed?.error?.details) {
          const retryInfo = parsed.error.details.find(
            (detail: any) => detail['@type']?.includes('RetryInfo')
          );
          
          if (retryInfo?.retryDelay) {
            const match = retryInfo.retryDelay.match(/(\d+)s/);
            if (match) {
              const seconds = parseInt(match[1], 10);
              console.log(`[RETRY] Google recommends retry after ${seconds} seconds`);
              return seconds * 1000;
            }
          }
        }
      } catch (parseError) {
        // Ignore JSON parse errors
      }
    }
  } catch (e) {
    console.error('[RETRY] Error parsing retry delay:', e);
  }
  
  // Default to 47 seconds if we can't parse the delay
  console.log('[RETRY] Using default retry delay of 47 seconds');
  return 47000;
}

/**
 * Check if an error is a quota/rate limit error
 */
export function isQuotaError(error: any): boolean {
  // Check status code
  if (error?.statusCode === 429) {
    return true;
  }
  
  // Check error message
  if (error?.message) {
    const message = error.message.toLowerCase();
    if (message.includes('quota') || message.includes('rate limit') || message.includes('429')) {
      return true;
    }
  }
  
  // Check response body
  if (error?.responseBody && typeof error.responseBody === 'string') {
    const body = error.responseBody.toLowerCase();
    if (body.includes('resource_exhausted') || body.includes('quota')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sleep for a specified duration with optional progress callback
 */
export async function sleepWithProgress(
  durationMs: number,
  progressCallback?: (remainingMs: number) => void,
  intervalMs: number = 10000
): Promise<void> {
  const startTime = Date.now();
  const endTime = startTime + durationMs;
  
  // Initial callback
  if (progressCallback) {
    progressCallback(durationMs);
  }
  
  while (Date.now() < endTime) {
    const remainingMs = endTime - Date.now();
    const sleepTime = Math.min(intervalMs, remainingMs);
    
    if (sleepTime > 0) {
      await new Promise(resolve => setTimeout(resolve, sleepTime));
      
      const newRemainingMs = endTime - Date.now();
      if (newRemainingMs > 0 && progressCallback && sleepTime >= intervalMs) {
        progressCallback(newRemainingMs);
      }
    }
  }
}

/**
 * Format remaining time for user display
 */
export function formatRemainingTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds <= 0) return 'a moment';
  if (seconds === 1) return '1 second';
  if (seconds < 60) return `${seconds} seconds`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 1 && remainingSeconds === 0) return '1 minute';
  if (minutes === 1) return `1 minute ${remainingSeconds} seconds`;
  if (remainingSeconds === 0) return `${minutes} minutes`;
  return `${minutes} minutes ${remainingSeconds} seconds`;
}