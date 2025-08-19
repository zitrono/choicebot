'use client';

import { ActionButtons } from './action-buttons';
import { QuizRenderer } from './quiz-renderer';
import { RecommendationCards } from './recommendation-cards';

interface StructuredMessageProps {
  type: 'quiz' | 'recommendations' | 'actions';
  data: any;
  onResponse?: (response: any) => void;
}

export function StructuredMessage({ type, data, onResponse }: StructuredMessageProps) {
  
  switch (type) {
    case 'quiz':
      return <QuizRenderer data={data} onSubmit={onResponse || (() => {})} />;
    case 'recommendations':
      return <RecommendationCards data={data} onAction={onResponse} />;
    case 'actions':
      return <ActionButtons data={data} onAction={onResponse} />;
    default:
      return (
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <pre className="text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}