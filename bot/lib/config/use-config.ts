'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { BotConfig } from './types';

// This will be set by the provider
let globalConfig: BotConfig | null = null;

export function setGlobalConfig(config: BotConfig) {
  globalConfig = config;
}

export function useConfig(): BotConfig {
  const pathname = usePathname();
  
  const config = useMemo(() => {
    // In production, this would fetch config based on pathname
    // For now, return the global config
    if (!globalConfig) {
      console.warn('Config not initialized, using default');
      // Return a default config structure
      return {
        id: 'verbier',
        metadata: {
          name: 'Verbier Festival Concierge',
          packageName: 'verbier-festival-concierge',
          version: '0.1.0',
          description: 'Festival Concierge for the Verbier Festival',
          longDescription: 'Festival Concierge for the Verbier Festival',
          keywords: ['Verbier Festival'],
          domain: 'https://choice-bot.vercel.app'
        },
        branding: {
          appTitle: 'Festival Concierge | Verbier Festival 2025',
          navbarTitle: 'Verbier Festival Concierge',
          themeStorageKey: 'verbier-theme',
          primaryColor: '#0C4DA2',
          primaryColorName: 'verbier-blue',
          colorScheme: {
            light: '212 84% 34%',
            dark: '212 84% 45%'
          },
          logo: {
            svg: '/verbier-festival-logo.svg',
            iconComponent: 'ConciergeIcon'
          },
          favicon: '/favicon.ico'
        },
        ui: {
          welcomeMessage: {
            title: 'Welcome to Verbier Festival 2025! 🎼',
            subtitle: 'I\'m your Festival Digital Concierge',
            callToAction: 'How may I assist you today?',
            options: [],
            closing: ''
          },
          openGraph: {
            title: 'Festival Concierge | Verbier Festival',
            description: 'Your Festival Concierge',
            alt: 'Verbier Festival Concierge',
            image: {
              title: 'Verbier Festival',
              subtitle: 'CONCIERGE',
              tagline: 'Your Personal Classical Music Experience Curator',
              footer: 'Swiss Alps • July 17 - August 3, 2025',
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
            dataFile: 'data/verbier.txt',
            uploadStrategy: 'google-files-api',
            displayName: 'Verbier Festival Content',
            cacheHours: 48,
            fileManagerClass: 'VerbierFileManager'
          },
          prompts: {
            systemPromptFile: 'prompts/verbier-system-prompt.ts',
            personalizationEnabled: true,
            fallbackPrompt: 'You are a helpful assistant for the Verbier Festival.',
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
          fileUpload: true,
          structuredResponses: true,
          choices: true,
          quizzes: true,
          recommendations: true,
          weather: false,
          reservations: true
        },
        schemas: {
          festival: true,
          assistantResponse: true,
          choice: true,
          quiz: true
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
      } as BotConfig;
    }
    
    return globalConfig;
  }, [pathname]);
  
  return config;
}