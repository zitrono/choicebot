import { z } from 'zod';

// Minimal option schema for choices
export const ChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string()
});

// Ultra-simple choice schema - just boolean for single vs multiple
export const ChoiceSchema = z.object({
  multiple_choice: z.boolean().describe(
    'false = radio buttons (single selection), true = checkboxes (multiple selection)'
  ),
  description: z.string().optional().describe('Optional additional context or instructions for the choices'),
  options: z.array(ChoiceOptionSchema).min(2).max(8).describe('The available choices - questions should be included in the text field')
});

// Type exports
export type ChoiceOption = z.infer<typeof ChoiceOptionSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;