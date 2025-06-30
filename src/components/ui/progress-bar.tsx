import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  isProcessing?: boolean;
  className?: string;
  showText?: boolean;
  failedFiles?: number;
  totalFiles?: number;
  databaseStatus?: 'active' | 'error' | 'checking';
  pendingFiles?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  isProcessing = false,
  className,
  showText = true,
  failedFiles = 0,
  totalFiles = 0,
  databaseStatus,
  pendingFiles = 0
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        {showText && (
          <span className="text-xs font-medium text-gray-700">
            {(() => {
              if (databaseStatus === 'error') {
                return <span className="text-red-600">Invalid Credentials</span>;
              }
              if (failedFiles > 0 && !isProcessing && pendingFiles === 0) {
                return <span className="text-red-600">Failed</span>;
              }
              if (databaseStatus === 'checking') {
                return <span className="text-blue-600">Checking Database...</span>;
              }
              if (pendingFiles > 0 && !isProcessing) {
                return <span className="text-yellow-600">Pending</span>;
              }
              if (isProcessing) {
                return 'Processing...';
              }
              if (failedFiles > 0) {
                return <span className="text-red-600">Completed with Errors</span>;
              }
              return 'Completed';
            })()}
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
            (() => {
              if (databaseStatus === 'error') {
                return "bg-red-500";
              }
              if (failedFiles > 0 && !isProcessing && pendingFiles === 0) {
                return "bg-red-500";
              }
              if (databaseStatus === 'checking') {
                return "bg-blue-400 animate-pulse";
              }
              if (pendingFiles > 0 && !isProcessing) {
                return "bg-yellow-500";
              }
              if (isProcessing) {
                return "bg-blue-500 animate-pulse";
              }
              if (failedFiles > 0) {
                return "bg-orange-500"; // Completed with errors
              }
              if (percentage === 100) {
                return "bg-green-500";
              }
              return "bg-blue-500";
            })()
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};