'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Choice } from '@/lib/schemas/choice.schema';

interface PillChoiceRendererProps {
  data: Choice;
  onChoiceSelect: (text: string) => void;
}

export function PillChoiceRenderer({ data, onChoiceSelect }: PillChoiceRendererProps) {
  // State for selections - string for single choice, array for multiple choice
  const [selection, setSelection] = useState<string | string[]>(
    data.multiple_choice ? [] : ''
  );

  const handleSingleChoice = (optionId: string) => {
    setSelection(optionId);
  };

  const handleMultipleChoice = (optionId: string) => {
    setSelection(prev => {
      const current = prev as string[];
      if (current.includes(optionId)) {
        return current.filter(id => id !== optionId);
      } else {
        return [...current, optionId];
      }
    });
  };
  
  // Handle selection changes and notify parent
  useEffect(() => {
    if (data.multiple_choice && Array.isArray(selection)) {
      const selectedTexts = selection
        .map(id => data.options.find(opt => opt.id === id)?.text)
        .filter(Boolean);
      onChoiceSelect(selectedTexts.join(', '));
    } else if (!data.multiple_choice && selection && typeof selection === 'string') {
      const selectedOption = data.options.find(opt => opt.id === selection);
      onChoiceSelect(selectedOption?.text || '');
    }
  }, [selection, data.multiple_choice, data.options, onChoiceSelect]);

  return (
    <>
      {/* Description */}
      {data.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          {data.description}
        </p>
      )}

      {/* Pill Options */}
      <div className="flex flex-wrap gap-2 justify-center">
        {data.options.map((option) => {
          const isSelected = data.multiple_choice 
            ? (selection as string[]).includes(option.id)
            : selection === option.id;

          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => data.multiple_choice 
                ? handleMultipleChoice(option.id) 
                : handleSingleChoice(option.id)
              }
              className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-verbier-blue text-white shadow-md border-transparent'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 border-zinc-200 dark:border-zinc-600'
              }`}
            >
              <span>{option.text}</span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}