
import React from 'react';
import { ExerciseStep } from '../types.ts';

interface ProgressBarProps {
  steps: ExerciseStep[];
  currentStepIndex: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                index <= currentStepIndex 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-xs mt-2 font-medium ${index <= currentStepIndex ? 'text-indigo-600' : 'text-slate-400'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div 
                className={`absolute h-[2px] w-full top-4 left-1/2 transition-all duration-300 ${
                  index < currentStepIndex ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
