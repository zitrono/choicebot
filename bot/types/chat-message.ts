import { UIMessage } from 'ai';
import { Choice } from '@/lib/schemas/choice.schema';

export type ChatUIMessage = UIMessage<
  never,
  {
    choices: Choice & { status: 'loading' | 'ready' };
  }
>;