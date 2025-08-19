'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface QuizQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice';
  question: string;
  options: Array<{ id: string; text: string }>;
}

interface QuizRendererProps {
  data: {
    questions: QuizQuestion[];
    metadata?: any;
  };
  onSubmit: (answers: Record<string, any>) => void;
}

export function QuizRenderer({ data, onSubmit }: QuizRendererProps) {
  
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleSingleChoice = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleChoice = (questionId: string, optionId: string) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id: string) => id !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const handleNext = () => {
    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const question = data.questions[currentQuestion];
  if (!question) return null;

  const isAnswered = answers[question.id] !== undefined && 
    (question.type === 'single_choice' ? answers[question.id] : answers[question.id]?.length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-xl shadow-lg"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Question {currentQuestion + 1} of {data.questions.length}</span>
          <span>{Math.round((currentQuestion + 1) / data.questions.length * 100)}%</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div 
            className="bg-verbier-blue h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentQuestion + 1) / data.questions.length * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.type === 'single_choice' && question.options.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSingleChoice(question.id, option.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              answers[question.id] === option.id
                ? 'border-verbier-blue bg-verbier-blue/10 dark:bg-verbier-blue/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-verbier-blue/50'
            }`}
          >
            <div className="flex items-center">
              <div className={`size-4 rounded-full border-2 mr-3 ${
                answers[question.id] === option.id
                  ? 'border-verbier-blue bg-verbier-blue'
                  : 'border-zinc-400'
              }`}>
                {answers[question.id] === option.id && (
                  <div className="size-full rounded-full bg-white scale-50" />
                )}
              </div>
              <span className="text-zinc-700 dark:text-zinc-300">{option.text}</span>
            </div>
          </motion.button>
        ))}

        {question.type === 'multiple_choice' && question.options.map((option) => {
          const isSelected = (answers[question.id] || []).includes(option.id);
          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMultipleChoice(question.id, option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-verbier-blue bg-verbier-blue/10 dark:bg-verbier-blue/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-verbier-blue/50'
              }`}
            >
              <div className="flex items-center">
                <div className={`size-4 rounded border-2 mr-3 ${
                  isSelected
                    ? 'border-verbier-blue bg-verbier-blue'
                    : 'border-zinc-400'
                }`}>
                  {isSelected && (
                    <svg className="size-full text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-zinc-700 dark:text-zinc-300">{option.text}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {currentQuestion > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
            !isAnswered
              ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-500 cursor-not-allowed'
              : 'bg-verbier-blue hover:bg-verbier-blue/90 text-white'
          }`}
        >
          {currentQuestion < data.questions.length - 1 ? 'Next' : 'Submit'}
        </button>
      </div>
    </motion.div>
  );
}