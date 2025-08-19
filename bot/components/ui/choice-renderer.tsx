'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Choice } from '@/lib/schemas/choice.schema';

interface ChoiceRendererProps {
  data: Choice;
  onChoiceSelect: (text: string) => void;
}

export function ChoiceRenderer({ data, onChoiceSelect }: ChoiceRendererProps) {
  // State for selections - string for single choice, array for multiple choice
  const [selection, setSelection] = useState<string | string[]>(
    data.multiple_choice ? [] : ''
  );


  const handleSingleChoice = (optionId: string) => {
    setSelection(optionId);
    // Directly call onChoiceSelect with the new selection
    const selectedOption = data.options.find(opt => opt.id === optionId);
    onChoiceSelect(selectedOption?.text || '');
  };

  const handleMultipleChoice = (optionId: string) => {
    setSelection(prev => {
      const current = prev as string[];
      let newSelection: string[];
      if (current.includes(optionId)) {
        newSelection = current.filter(id => id !== optionId);
      } else {
        newSelection = [...current, optionId];
      }
      
      // Directly call onChoiceSelect with the new selection
      const selectedTexts = newSelection
        .map(id => data.options.find(opt => opt.id === id)?.text)
        .filter(Boolean);
      onChoiceSelect(selectedTexts.join(', '));
      
      return newSelection;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-xl shadow-lg"
    >
      {/* Description */}
      {data.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {data.description}
        </p>
      )}

      {/* Options */}
      <div className="space-y-3">
        {data.options.map((option) => {
          const isSelected = data.multiple_choice 
            ? (selection as string[]).includes(option.id)
            : selection === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => data.multiple_choice 
                ? handleMultipleChoice(option.id) 
                : handleSingleChoice(option.id)
              }
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-verbier-blue bg-verbier-blue/10 dark:bg-verbier-blue/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-verbier-blue/50'
              }`}
            >
              <div className="flex items-center">
                {/* Radio button for single choice */}
                {!data.multiple_choice && (
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    isSelected
                      ? 'border-verbier-blue bg-verbier-blue'
                      : 'border-zinc-400'
                  }`}>
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                )}

                {/* Checkbox for multiple choice */}
                {data.multiple_choice && (
                  <div className={`w-4 h-4 rounded border-2 mr-3 ${
                    isSelected
                      ? 'border-verbier-blue bg-verbier-blue'
                      : 'border-zinc-400'
                  }`}>
                    {isSelected && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}

                <span className="text-zinc-700 dark:text-zinc-300">{option.text}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}