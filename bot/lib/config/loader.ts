import { BotConfig } from './types';
import fs from 'fs';
import path from 'path';

class ConfigLoader {
  private static instance: ConfigLoader;
  private configs: Map<string, BotConfig> = new Map();
  private currentConfig: BotConfig | null = null;
  
  private constructor() {
    this.loadConfigs();
  }
  
  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }
  
  private loadConfigs() {
    const configDir = path.join(process.cwd(), 'configs');
    
    // Load all config files
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const configPath = path.join(configDir, file);
            const configData = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(configData) as BotConfig;
            this.configs.set(config.id, config);
            console.log(`Loaded config: ${config.id}`);
          } catch (error) {
            console.error(`Failed to load config ${file}:`, error);
          }
        }
      }
    }
    
    // Set default config if no current config
    if (!this.currentConfig) {
      this.currentConfig = this.configs.get('verbier') || this.configs.get('default') || null;
    }
  }
  
  getConfig(configId?: string): BotConfig {
    if (configId && this.configs.has(configId)) {
      this.currentConfig = this.configs.get(configId)!;
      return this.currentConfig;
    }
    
    if (!this.currentConfig) {
      // Try to load verbier as default for backward compatibility
      this.currentConfig = this.configs.get('verbier') || this.configs.get('default') || this.createDefaultConfig();
    }
    
    return this.currentConfig;
  }
  
  getConfigFromPath(pathname: string): BotConfig {
    // Extract config ID from path (e.g., /verbier/chat -> verbier)
    const segments = pathname.split('/').filter(Boolean);
    
    // Check if first segment is a valid config ID
    if (segments.length > 0 && this.configs.has(segments[0])) {
      return this.getConfig(segments[0]);
    }
    
    // Default to current config
    return this.getConfig();
  }
  
  getAllConfigs(): BotConfig[] {
    return Array.from(this.configs.values());
  }
  
  private createDefaultConfig(): BotConfig {
    return {
      id: 'default',
      metadata: {
        name: 'AI Assistant',
        packageName: 'ai-assistant',
        version: '0.1.0',
        description: 'AI Assistant',
        longDescription: 'A helpful AI assistant powered by advanced language models.',
        keywords: ['AI', 'assistant', 'chatbot'],
        domain: 'https://choice-bot.vercel.app'
      },
      branding: {
        appTitle: 'AI Assistant',
        navbarTitle: 'AI Assistant',
        themeStorageKey: 'assistant-theme',
        primaryColor: '#0066CC',
        primaryColorName: 'primary-blue',
        colorScheme: {
          light: '212 100% 40%',
          dark: '212 100% 50%'
        },
        logo: {
          svg: null,
          iconComponent: 'BotIcon'
        },
        favicon: '/favicon.ico'
      },
      ui: {
        welcomeMessage: {
          title: 'Welcome! 👋',
          subtitle: 'I\'m your AI assistant. How can I help you today?',
          callToAction: 'What would you like to know?',
          options: [],
          closing: ''
        },
        openGraph: {
          title: 'AI Assistant',
          description: 'Your helpful AI assistant',
          alt: 'AI Assistant',
          image: {
            title: 'AI',
            subtitle: 'ASSISTANT',
            tagline: 'Here to help',
            footer: '',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
        }
      },
      ai: {
        model: {
          provider: 'google',
          name: 'gemini-2.5-flash',
          experimental: false,
          apiKeyEnv: 'GOOGLE_GENERATIVE_AI_API_KEY'
        },
        context: {
          dataFile: null,
          uploadStrategy: 'none',
          displayName: 'Knowledge Base',
          cacheHours: 48,
          fileManagerClass: 'DefaultFileManager'
        },
        prompts: {
          systemPromptFile: null,
          personalizationEnabled: false,
          fallbackPrompt: 'You are a helpful AI assistant. Please provide accurate and helpful responses.',
          promptVariables: {}
        },
        retryStrategy: {
          maxDuration: 150,
          quotaHandling: true
        }
      },
      features: {
        authentication: false,
        chatHistory: true,
        fileUpload: false,
        structuredResponses: false,
        choices: false,
        quizzes: false,
        recommendations: false,
        weather: false,
        reservations: false
      },
      schemas: {
        festival: false,
        assistantResponse: true,
        choice: false,
        quiz: false
      },
      routes: {
        basePath: '/',
        apiRoutes: {
          chat: '/api/chat',
          files: '/api/files/upload',
          history: '/api/history',
          reservation: '/api/reservation'
        }
      }
    };
  }
}

// Export singleton instance methods
export const configLoader = ConfigLoader.getInstance();
export const getConfig = (configId?: string) => configLoader.getConfig(configId);
export const getConfigFromPath = (pathname: string) => configLoader.getConfigFromPath(pathname);
export const getAllConfigs = () => configLoader.getAllConfigs();