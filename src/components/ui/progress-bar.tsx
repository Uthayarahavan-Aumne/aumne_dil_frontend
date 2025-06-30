import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  isProcessing?: boolean;
  className?: string;
  showText?: boolean;
  failedFiles?: number;
  totalFiles?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  isProcessing = false,
  className,
  showText = true,
  failedFiles = 0,
  totalFiles = 0
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        {showText && (
          <span className="text-xs font-medium text-gray-700">
            {isProcessing ? 'Processing...' : 'Completed'}
            {failedFiles > 0 && (
              <span className="text-red-600 ml-1">
                ({failedFiles} failed)
              </span>
            )}
          </span>
        )}
        {showText && (
          <span className="text-xs text-gray-500">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            isProcessing 
              ? "bg-blue-500 animate-pulse" 
              : percentage === 100 
                ? "bg-green-500" 
                : "bg-blue-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};