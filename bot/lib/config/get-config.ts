// Simple config getter that works in both server and edge runtime
import { BotConfig } from './types';
import { verbierConfig, medicalConfig, defaultConfig } from './config-data';

// Map of available configurations
const configs = new Map<string, BotConfig>([
  ['verbier', verbierConfig],
  ['medical', medicalConfig],
  ['default', defaultConfig]
]);

/**
 * Get configuration by ID or path
 * This works in both server and edge runtime
 */
export function getConfig(configId?: string): BotConfig {
  // Default to verbier for backward compatibility
  const id = configId || 'verbier';
  
  return configs.get(id) || verbierConfig;
}

/**
 * Get configuration from URL pathname
 */
export function getConfigFromPath(pathname: string): BotConfig {
  // Extract config ID from path (e.g., /verbier/chat -> verbier)
  const segments = pathname.split('/').filter(Boolean);
  
  // Check if first segment is a valid config ID
  if (segments.length > 0 && configs.has(segments[0])) {
    return getConfig(segments[0]);
  }
  
  // Default to verbier config
  return getConfig();
}