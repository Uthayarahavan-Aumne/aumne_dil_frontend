
import { useState, useEffect, useCallback } from 'react';
import { UploadJob } from '@/lib/api';
import { useFileProgress } from './useFileProgress';

export interface UploadProgressStage {
  stage: 'validation' | 'upload' | 'extracting' | 'building' | 'generating' | 'complete' | 'error';
  label: string;
  progress: number;
  description: string;
}

export interface FileBasedProgressInfo {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  pendingFiles: number;
  processingFiles: number;
  overallProgress: number;
}

export const useUploadProgress = (uploadJob?: UploadJob, projectKey?: string) => {
  const [stages, setStages] = useState<UploadProgressStage[]>([
    { stage: 'validation', label: 'Validating files', progress: 0, description: 'Checking file type and size...' },
    { stage: 'upload', label: 'Uploading', progress: 0, description: 'Transferring files to server...' },
    { stage: 'extracting', label: 'Processing VXML files', progress: 0, description: 'Extracting dialog nodes from files...' },
    { stage: 'building', label: 'Building knowledge graph', progress: 0, description: 'Creating node relationships...' },
    { stage: 'generating', label: 'Generating visualizations', progress: 0, description: 'Preparing graph visualizations...' },
  ]);

  const [currentStage, setCurrentStage] = useState<number>(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  
  // Get file-based progress data
  const { data: fileProgress } = useFileProgress(projectKey);

  const updateStageProgress = useCallback((stageIndex: number, progress: number) => {
    setStages(prev => prev.map((stage, index) => 
      index === stageIndex ? { ...stage, progress } : stage
    ));
  }, []);

  useEffect(() => {
    if (!uploadJob) return;

    switch (uploadJob.status) {
      case 'queued':
        setCurrentStage(0);
        updateStageProgress(0, 100);
        updateStageProgress(1, 100); // Upload complete when queued
        break;
      case 'processing':
        setCurrentStage(2); // Move to extracting stage
        updateStageProgress(0, 100); // Validation complete
        updateStageProgress(1, 100); // Upload complete
        
        // Use file-based progress for processing stages
        if (fileProgress && fileProgress.total_files > 0) {
          const extractingProgress = fileProgress.progress_percentage;
          updateStageProgress(2, extractingProgress);
          
          // If we're making good progress, move to building stage
          if (extractingProgress > 50) {
            setCurrentStage(3);
            updateStageProgress(3, Math.max(0, extractingProgress - 25));
          }
          
          // If almost done, move to generating stage
          if (extractingProgress > 80) {
            setCurrentStage(4);
            updateStageProgress(4, Math.max(0, extractingProgress - 10));
          }
        } else {
          // Fallback to time-based simulation if no file progress available
          updateStageProgress(2, Math.random() * 100);
        }
        break;
      case 'completed':
        setCurrentStage(4);
        stages.forEach((_, index) => updateStageProgress(index, 100));
        break;
      case 'failed':
        setCurrentStage(-1);
        break;
    }
  }, [uploadJob, fileProgress, updateStageProgress]);

  // Create file-based progress info
  const fileBasedProgress: FileBasedProgressInfo | null = fileProgress ? {
    totalFiles: fileProgress.total_files,
    processedFiles: fileProgress.processed_files,
    failedFiles: fileProgress.failed_files,
    pendingFiles: fileProgress.pending_files,
    processingFiles: fileProgress.processing_files,
    overallProgress: fileProgress.progress_percentage,
  } : null;

  return {
    stages,
    currentStage,
    estimatedTimeRemaining,
    updateStageProgress,
    fileProgress: fileBasedProgress,
  };
};
