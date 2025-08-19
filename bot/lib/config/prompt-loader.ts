import fs from 'fs';
import path from 'path';
import { BotConfig } from './types';

/**
 * Load and process prompts based on configuration
 */
export class PromptLoader {
  private config: BotConfig;
  
  constructor(config: BotConfig) {
    this.config = config;
  }
  
  /**
   * Get the system prompt from configuration
   * Can load from file or use inline prompt
   */
  getSystemPrompt(): string {
    // For now, keep using the existing Verbier prompt system
    // In future, this would load from config.ai.prompts.systemPromptFile
    // or use inline prompts from config
    
    if (this.config.id === 'verbier') {
      // Use existing Verbier prompt system for backward compatibility
      const { getSystemPrompt } = require('@/prompts/verbier-system-prompt');
      return getSystemPrompt();
    }
    
    // For other configs, use fallback prompt
    return this.config.ai.prompts.fallbackPrompt;
  }
  
  /**
   * Get the personalization framework if enabled
   */
  getPersonalizationFramework(): string | null {
    if (!this.config.ai.prompts.personalizationEnabled) {
      return null;
    }
    
    if (this.config.id === 'verbier') {
      // Use existing Verbier personalization for backward compatibility
      const { getPersonalizationFramework } = require('@/prompts/verbier-system-prompt');
      return getPersonalizationFramework();
    }
    
    return null;
  }
  
  /**
   * Get the data content (for fallback when file upload fails)
   */
  getDataContent(): string | null {
    if (!this.config.ai.context.dataFile) {
      return null;
    }
    
    if (this.config.id === 'verbier') {
      // Use existing Verbier content loader for backward compatibility
      const { getVerbierContentOnly } = require('@/prompts/verbier-system-prompt');
      return getVerbierContentOnly();
    }
    
    // For other configs, try to load the data file directly
    try {
      const dataPath = path.join(process.cwd(), this.config.ai.context.dataFile);
      if (fs.existsSync(dataPath)) {
        return fs.readFileSync(dataPath, 'utf-8');
      }
    } catch (error) {
      console.error('Failed to load data content:', error);
    }
    
    return null;
  }
  
  /**
   * Replace variables in prompts
   */
  replaceVariables(text: string): string {
    if (!this.config.ai.prompts.promptVariables) {
      return text;
    }
    
    let result = text;
    for (const [key, value] of Object.entries(this.config.ai.prompts.promptVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }
}