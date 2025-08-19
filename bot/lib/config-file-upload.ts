/**
 * Generic Files API Manager for uploading and referencing files
 * Works with any configuration
 */

import fs from 'fs';
import path from 'path';

import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { BotConfig } from '@/lib/config/types';

export class ConfigurableFileManager {
  private fileManager: GoogleAIFileManager;
  private fileUri: string | null = null;
  private fileName: string | null = null;
  private fileExpirationTime: Date | null = null;
  private config: BotConfig;
  
  constructor(apiKey: string, config: BotConfig) {
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.config = config;
  }
  
  /**
   * Get or upload content to Google Files API based on configuration
   * Files are stored for 48 hours and can be reused across requests
   */
  async getOrUploadContent(): Promise<string | null> {
    // If no data file configured, return null
    if (!this.config.ai.context.dataFile) {
      return null;
    }
    
    try {
      // Check if we have a valid cached URI
      if (this.fileUri && this.isFileValid()) {
        const hoursRemaining = Math.floor((this.fileExpirationTime!.getTime() - Date.now()) / (1000 * 60 * 60));
        // File is still valid and can be reused
        return this.fileUri;
      }
      
      // Build file path
      const filePath = path.join(process.cwd(), this.config.ai.context.dataFile);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`Data file not found at: ${filePath}`);
        return null;
      }
      
      // Get file size for logging
      const stats = fs.statSync(filePath);
      const fileSizeKB = Math.round(stats.size / 1024);
      
      console.log(`Uploading ${this.config.ai.context.displayName} (${fileSizeKB}KB)`);
      
      // Upload the file
      const uploadResult = await this.fileManager.uploadFile(filePath, {
        mimeType: 'text/plain',
        displayName: this.config.ai.context.displayName
      });
      
      // Wait for file to be ready
      let file = uploadResult.file;
      while (file.state === FileState.PROCESSING) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const getResult = await this.fileManager.getFile(file.name);
        file = getResult;
      }
      
      if (file.state === FileState.FAILED) {
        throw new Error('File processing failed');
      }
      
      // Store file info
      this.fileUri = file.uri;
      this.fileName = file.name;
      
      // Set expiration time (48 hours from now)
      this.fileExpirationTime = new Date(Date.now() + this.config.ai.context.cacheHours * 60 * 60 * 1000);
      
      console.log(`File uploaded successfully: ${this.config.ai.context.displayName}`);
      console.log(`File will be valid for ${this.config.ai.context.cacheHours} hours`);
      
      return this.fileUri;
      
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  }
  
  /**
   * Check if the current file URI is still valid
   */
  private isFileValid(): boolean {
    if (!this.fileExpirationTime) return false;
    return Date.now() < this.fileExpirationTime.getTime();
  }
  
  /**
   * Get the current file URI if valid
   */
  getFileUri(): string | null {
    if (this.isFileValid()) {
      return this.fileUri;
    }
    return null;
  }
  
  /**
   * Clear cached file information
   */
  clearCache(): void {
    this.fileUri = null;
    this.fileName = null;
    this.fileExpirationTime = null;
  }
}

// Singleton instance management
let fileManagerInstance: ConfigurableFileManager | null = null;

export function getFileManager(config: BotConfig): ConfigurableFileManager {
  const apiKey = process.env[config.ai.model.apiKeyEnv];
  
  if (!apiKey) {
    throw new Error(`API key not found for environment variable: ${config.ai.model.apiKeyEnv}`);
  }
  
  // Create or return existing instance
  if (!fileManagerInstance) {
    fileManagerInstance = new ConfigurableFileManager(apiKey, config);
  }
  
  return fileManagerInstance;
}