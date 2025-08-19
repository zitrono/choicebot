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
    // Check for specific prompt file configurations
    if (this.config.id === 'verbier') {
      // Use existing Verbier prompt system for backward compatibility
      const { getSystemPrompt } = require('@/prompts/verbier-system-prompt');
      return getSystemPrompt();
    }
    
    if (this.config.id === 'medical') {
      // Use medical diagnostic prompt system
      const { getMedicalSystemPrompt } = require('@/prompts/medical-system-prompt');
      return getMedicalSystemPrompt();
    }
    
    // For other configs, check if systemPromptFile is specified
    if (this.config.ai.prompts.systemPromptFile) {
      try {
        // Try to load the prompt file dynamically
        const promptModule = require(`@/${this.config.ai.prompts.systemPromptFile.replace('.ts', '')}`);
        if (promptModule.getSystemPrompt) {
          return promptModule.getSystemPrompt();
        }
        // Handle configs with different function names
        const funcName = `get${this.config.id.charAt(0).toUpperCase()}${this.config.id.slice(1)}SystemPrompt`;
        if (promptModule[funcName]) {
          return promptModule[funcName]();
        }
      } catch (error) {
        console.error(`Failed to load system prompt from ${this.config.ai.prompts.systemPromptFile}:`, error);
      }
    }
    
    // Fall back to inline prompt
    return this.replaceVariables(this.config.ai.prompts.fallbackPrompt);
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
    
    if (this.config.id === 'medical') {
      // Use medical diagnostic framework
      const { getMedicalDiagnosticFramework } = require('@/prompts/medical-system-prompt');
      return getMedicalDiagnosticFramework();
    }
    
    // For other configs with personalization enabled, try to load from file
    if (this.config.ai.prompts.systemPromptFile) {
      try {
        const promptModule = require(`@/${this.config.ai.prompts.systemPromptFile.replace('.ts', '')}`);
        if (promptModule.getPersonalizationFramework) {
          return promptModule.getPersonalizationFramework();
        }
        // Handle configs with different function names
        const funcName = `get${this.config.id.charAt(0).toUpperCase()}${this.config.id.slice(1)}DiagnosticFramework`;
        if (promptModule[funcName]) {
          return promptModule[funcName]();
        }
      } catch (error) {
        console.error(`Failed to load personalization framework:`, error);
      }
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
    
    if (this.config.id === 'medical') {
      // Use medical content loader
      const { getMedicalContentOnly } = require('@/prompts/medical-system-prompt');
      return getMedicalContentOnly();
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