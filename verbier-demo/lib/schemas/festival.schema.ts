import { z } from 'zod';

// Festival-specific preference questions
export const FestivalPreferencesSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    type: z.literal('single_choice'),
    question: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      category: z.enum(['symphony', 'chamber', 'recital', 'opera', 'masterclass']).optional()
    }))
  })).max(5)
});

// Concert recommendation schema
export const RecommendationSchema = z.object({
  recommendations: z.array(z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    time: z.string(),
    venue: z.string(),
    artists: z.array(z.string()),
    matchScore: z.number().min(0).max(100),
    reasoning: z.string(),
    action: z.object({
      type: z.enum(['view', 'book', 'save']),
      label: z.string(),
      url: z.string().optional()
    })
  })).max(5)
});

// Action buttons schema for interactive choices
export const ActionButtonsSchema = z.object({
  title: z.string(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    type: z.enum(['primary', 'secondary', 'outline']),
    action: z.enum(['message', 'link', 'quiz']),
    value: z.string() // message to send, url to open, or quiz type to start
  })).max(4)
});

// Type exports
export type FestivalPreferences = z.infer<typeof FestivalPreferencesSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type ActionButtons = z.infer<typeof ActionButtonsSchema>;