export interface BotConfig {
  id: string;
  metadata: {
    name: string;
    packageName: string;
    version: string;
    description: string;
    longDescription: string;
    keywords: string[];
    domain: string;
  };
  
  branding: {
    appTitle: string;
    navbarTitle: string;
    themeStorageKey: string;
    primaryColor: string;
    primaryColorName: string;
    colorScheme: {
      light: string;
      dark: string;
    };
    logo: {
      svg: string | null;
      iconComponent: string;
    };
    favicon: string;
  };
  
  ui: {
    welcomeMessage: {
      title: string;
      subtitle: string;
      callToAction: string;
      options: string[];
      closing: string;
    };
    openGraph: {
      title: string;
      description: string;
      alt: string;
      image: {
        title: string;
        subtitle: string;
        tagline: string;
        footer: string;
        gradient: string;
      };
    };
  };
  
  ai: {
    model: {
      provider: string;
      name: string;
      experimental: boolean;
      apiKeyEnv: string;
    };
    
    context: {
      dataFile: string | null;
      uploadStrategy: string;
      displayName: string;
      cacheHours: number;
      fileManagerClass: string;
    };
    
    prompts: {
      systemPromptFile: string | null;
      personalizationEnabled: boolean;
      fallbackPrompt: string;
      promptVariables: Record<string, string>;
    };
    
    retryStrategy: {
      maxDuration: number;
      quotaHandling: boolean;
    };
  };
  
  features: {
    authentication: boolean;
    chatHistory: boolean;
    fileUpload: boolean;
    structuredResponses: boolean;
    choices: boolean;
    quizzes: boolean;
    recommendations: boolean;
    weather: boolean;
    reservations: boolean;
  };
  
  schemas: {
    festival: boolean;
    assistantResponse: boolean;
    choice: boolean;
    quiz: boolean;
  };
  
  routes: {
    basePath: string;
    apiRoutes: {
      chat: string;
      files: string;
      history: string;
      reservation: string;
    };
  };
}