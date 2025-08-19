// Static configuration data that can be imported anywhere
import { BotConfig } from './types';

export const verbierConfig: BotConfig = {
  id: 'verbier',
  metadata: {
    name: 'Verbier Festival Concierge',
    packageName: 'verbier-festival-concierge',
    version: '0.1.0',
    description: 'Festival Concierge for the Verbier Festival',
    longDescription: 'Festival Concierge for the Verbier Festival - your personal guide to creating customized classical music experiences in the Swiss Alps. Get personalized concert recommendations from 200+ performances featuring world-renowned artists.',
    keywords: ['Verbier Festival', 'classical music', 'Swiss Alps', 'concerts', 'Martha Argerich', 'festival concierge'],
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
      subtitle: 'I\'m your Festival Digital Concierge, at your service to curate the perfect classical music experience among our 200+ performances from July 17 to August 3.',
      callToAction: 'How may I assist you today?',
      options: [
        '🎵 Discover concerts matching your musical tastes',
        '🌄 Explore unique alpine venue experiences',
        '📅 Create a personalized festival itinerary',
        '🎭 Learn about featured artists and programs'
      ],
      closing: 'Allow me to learn about your preferences and create your ideal festival experience!'
    },
    openGraph: {
      title: 'Festival Concierge | Verbier Festival',
      description: 'Your Festival Concierge - discover your perfect classical music experience at Verbier Festival',
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
      fallbackPrompt: 'You are a helpful assistant for the Verbier Festival. Please provide assistance based on the context provided.',
      promptVariables: {
        eventCount: '200+',
        dateRange: 'July 17 to August 3',
        year: '2025',
        location: 'Swiss Alps',
        venueName: 'Verbier'
      }
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
};

// Default config for fallback
export const defaultConfig: BotConfig = {
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