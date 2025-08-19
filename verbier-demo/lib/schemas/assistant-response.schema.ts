import { z } from 'zod';

import { ChoiceSchema } from './choice.schema';

// Unified response schema - always includes text, optionally includes choices
export const AssistantResponseSchema = z.object({
  text: z.string().describe(
    'Main response text including any questions. Always provide helpful, contextual information about the festival, concerts, and recommendations. ' +
    'When choices are provided, include your question naturally in this text field since there is no separate question field in the choices schema.'
  ),
  
  choices: ChoiceSchema.optional().describe(
    'Interactive options for user selection. Include when users need to make choices or express preferences. ' +
    'Set multiple_choice: false for single selection (user picks one option). ' +
    'Set multiple_choice: true for multiple selections (user can select all that apply). ' +
    'Leave undefined for regular conversational responses.'
  )
});

// Type export
export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;