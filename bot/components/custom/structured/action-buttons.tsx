'use client';

import { motion } from 'framer-motion';

interface ActionButton {
  id: string;
  label: string;
  description?: string;
  type: 'primary' | 'secondary' | 'outline';
  action: 'message' | 'link' | 'quiz';
  value: string;
}

interface ActionButtonsProps {
  data: {
    title: string;
    actions: ActionButton[];
  };
  onAction?: (action: any) => void;
}

export function ActionButtons({ data, onAction }: ActionButtonsProps) {
  const handleClick = (action: ActionButton) => {
    if (onAction) {
      onAction({
        type: action.action,
        id: action.id,
        value: action.value
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {data.title && (
        <h3 className="text-center text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          {data.title}
        </h3>
      )}
      <div className="space-y-3">
        {data.actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleClick(action)}
            className={`w-full p-4 rounded-lg transition-all ${
              action.type === 'primary'
                ? 'bg-verbier-blue hover:bg-verbier-blue/90 text-white shadow-lg'
                : action.type === 'secondary'
                ? 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100'
                : 'border-2 border-zinc-300 dark:border-zinc-600 hover:border-verbier-blue dark:hover:border-verbier-blue bg-white/50 dark:bg-zinc-800/50'
            }`}
          >
            <div className="text-left">
              <div className="font-medium">{action.label}</div>
              {action.description && (
                <div className={`text-sm mt-1 ${
                  action.type === 'primary' 
                    ? 'text-white/80' 
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}>
                  {action.description}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}