
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Loader2, FileText } from 'lucide-react';
import { UploadProgressStage, FileBasedProgressInfo } from '@/hooks/useUploadProgress';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  stages: UploadProgressStage[];
  currentStage: number;
  estimatedTimeRemaining?: number | null;
  fileProgress?: FileBasedProgressInfo | null;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  stages,
  currentStage,
  estimatedTimeRemaining,
  fileProgress,
  className,
}) => {
  const getStageIcon = (index: number, stage: UploadProgressStage) => {
    if (currentStage === -1) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (index < currentStage) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (index === currentStage) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    
    return <Clock className="h-4 w-4 text-gray-300" />;
  };

  const getStageStatus = (index: number) => {
    if (currentStage === -1) return 'error';
    if (index < currentStage) return 'completed';
    if (index === currentStage) return 'active';
    return 'pending';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Progress Summary */}
      {fileProgress && fileProgress.totalFiles > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-900">File Processing Progress</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">
                {fileProgress.processedFiles} of {fileProgress.totalFiles} files processed
              </span>
              <span className="font-medium text-blue-900">
                {fileProgress.overallProgress.toFixed(1)}%
              </span>
            </div>
            
            <Progress 
              value={fileProgress.overallProgress} 
              className="h-3 bg-blue-100"
            />
            
            <div className="flex justify-between text-xs text-blue-600 mt-2">
              <span>Processed: {fileProgress.processedFiles}</span>
              {fileProgress.processingFiles > 0 && (
                <span>Processing: {fileProgress.processingFiles}</span>
              )}
              {fileProgress.pendingFiles > 0 && (
                <span>Pending: {fileProgress.pendingFiles}</span>
              )}
              {fileProgress.failedFiles > 0 && (
                <span className="text-red-600">Failed: {fileProgress.failedFiles}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {estimatedTimeRemaining && (
        <div className="text-sm text-gray-600 mb-4">
          Estimated time remaining: {Math.ceil(estimatedTimeRemaining / 60)} minutes
        </div>
      )}
      
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const status = getStageStatus(index);
          
          return (
            <div key={stage.stage} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getStageIcon(index, stage)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={cn(
                    'text-sm font-medium',
                    status === 'completed' && 'text-green-700',
                    status === 'active' && 'text-blue-700',
                    status === 'error' && 'text-red-700',
                    status === 'pending' && 'text-gray-500'
                  )}>
                    {stage.label}
                  </p>
                  {status === 'active' && (
                    <span className="text-xs text-gray-500">
                      {Math.round(stage.progress)}%
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mb-2">
                  {stage.description}
                </p>
                
                {(status === 'active' || status === 'completed') && (
                  <Progress 
                    value={status === 'completed' ? 100 : stage.progress} 
                    className="h-2"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
