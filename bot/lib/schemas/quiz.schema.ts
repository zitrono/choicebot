import { z } from 'zod';

// Basic option schema for quiz choices
export const OptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  value: z.string().optional()
});

// Single choice question (radio buttons)
export const SingleChoiceQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('single_choice'),
  question: z.string(),
  options: z.array(OptionSchema).min(2).max(6)
});

// Multiple choice question (checkboxes)
export const MultipleChoiceQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('multiple_choice'),
  question: z.string(),
  options: z.array(OptionSchema).min(2).max(8),
  minSelect: z.number().default(1),
  maxSelect: z.number().optional()
});

// Main quiz schema
export const QuizSchema = z.object({
  sessionId: z.string(),
  questions: z.array(
    z.discriminatedUnion('type', [
      SingleChoiceQuestionSchema,
      MultipleChoiceQuestionSchema
    ])
  ),
  metadata: z.object({
    purpose: z.enum(['preferences', 'feedback', 'survey', 'booking']),
    nextAction: z.enum(['submit', 'continue', 'review']).optional()
  })
});

// Type exports
export type Option = z.infer<typeof OptionSchema>;
export type SingleChoiceQuestion = z.infer<typeof SingleChoiceQuestionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;