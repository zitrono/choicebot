/**
 * Google Files API Manager for uploading and referencing files
 * Upload once, reference multiple times - reduces token usage by 99%
 */

import fs from 'fs';
import path from 'path';

import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';

export class VerbierFileManager {
  private fileManager: GoogleAIFileManager;
  private fileUri: string | null = null;
  private fileName: string | null = null;
  private fileExpirationTime: Date | null = null;
  private readonly VERBIER_FILE_PATH = path.join(process.cwd(), 'data', 'verbier.txt');
  
  constructor(apiKey: string) {
    this.fileManager = new GoogleAIFileManager(apiKey);
  }
  
  /**
   * Get or upload Verbier content to Google Files API
   * Files are stored for 48 hours and can be reused across requests
   */
  async getOrUploadVerbierContent(): Promise<string | null> {
    try {
      // Check if we have a valid cached URI
      if (this.fileUri && this.isFileValid()) {
        const hoursRemaining = Math.floor((this.fileExpirationTime!.getTime() - Date.now()) / (1000 * 60 * 60));
        // File is still valid and can be reused
        return this.fileUri;
      }
      
      // Check if file exists
      if (!fs.existsSync(this.VERBIER_FILE_PATH)) {
        // File not found at expected path
        return null;
      }
      
      // Get file size for logging
      const stats = fs.statSync(this.VERBIER_FILE_PATH);
      const fileSizeKB = Math.round(stats.size / 1024);
      
      // Uploading Verbier content
      
      // Upload the file
      const uploadResult = await this.fileManager.uploadFile(this.VERBIER_FILE_PATH, {
        mimeType: 'text/plain',
        displayName: 'Verbier Festival Content'
      });
      
      // Wait for processing to complete
      // Waiting for file processing
      let file = await this.fileManager.getFile(uploadResult.file.name);
      let attempts = 0;
      const maxAttempts = 30; // Max 30 seconds wait
      
      while (file.state === FileState.PROCESSING && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        file = await this.fileManager.getFile(uploadResult.file.name);
        attempts++;
      }
      
      if (file.state !== FileState.ACTIVE) {
        // File processing failed
        return null;
      }
      
      // Store file info
      this.fileUri = file.uri;
      this.fileName = file.name;
      this.fileExpirationTime = new Date(file.expirationTime);
      
      // Upload successful - file can be reused for 48 hours
      
      return this.fileUri;
    } catch (error) {
      // Upload failed - will fall back to inline content
      return null;
    }
  }
  
  /**
   * Check if uploaded file is still valid (not expired)
   */
  private isFileValid(): boolean {
    if (!this.fileExpirationTime) return false;
    
    const now = new Date();
    return now < this.fileExpirationTime;
  }
  
  /**
   * Get the current file URI if valid
   */
  getFileUri(): string | null {
    if (this.fileUri && this.isFileValid()) {
      return this.fileUri;
    }
    return null;
  }
}

// Singleton instance
let fileManagerInstance: VerbierFileManager | null = null;

/**
 * Get or create the singleton file manager instance
 */
export function getFileManager(apiKey?: string): VerbierFileManager {
  if (!fileManagerInstance) {
    if (!apiKey) {
      throw new Error('API key required for first file manager initialization');
    }
    fileManagerInstance = new VerbierFileManager(apiKey);
  }
  return fileManagerInstance;
}