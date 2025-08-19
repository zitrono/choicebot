'use client';

import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  artists: string[];
  matchScore: number;
  reasoning: string;
  action: {
    type: 'view' | 'book' | 'save';
    label: string;
    url?: string;
  };
}

interface RecommendationCardsProps {
  data: {
    recommendations: Recommendation[];
  };
  onAction?: (action: any) => void;
}

export function RecommendationCards({ data, onAction }: RecommendationCardsProps) {
  const handleAction = (rec: Recommendation) => {
    if (onAction) {
      onAction({
        type: rec.action.type,
        recommendationId: rec.id,
        title: rec.title
      });
    }
  };

  return (
    <div className="space-y-4 w-full max-w-2xl">
      {data.recommendations.map((rec, index) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          {/* Match score indicator */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {rec.title}
              </h3>
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <div className="text-xs text-zinc-500">Match</div>
                <div className="relative w-16 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-verbier-blue to-blue-600 rounded-full"
                    style={{ width: `${rec.matchScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {rec.matchScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Concert details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{rec.date} at {rec.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{rec.venue}</span>
            </div>
            {rec.artists.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <svg className="size-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="flex-1">{rec.artists.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Reasoning */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 italic">
            {rec.reasoning}
          </p>

          {/* Action button */}
          <button
            onClick={() => handleAction(rec)}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              rec.action.type === 'book' 
                ? 'bg-verbier-blue hover:bg-verbier-blue/90 text-white'
                : rec.action.type === 'view'
                ? 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100'
                : 'border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {rec.action.label}
          </button>
        </motion.div>
      ))}
    </div>
  );
}