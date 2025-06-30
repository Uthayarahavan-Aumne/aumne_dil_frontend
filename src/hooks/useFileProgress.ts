import { useQuery } from '@tanstack/react-query';
import { apiClient, FileProgress } from '@/lib/api';

export const useFileProgress = (projectKey?: string) => {
  return useQuery({
    queryKey: ['file-progress', projectKey],
    queryFn: async () => {
      if (!projectKey) {
        throw new Error('Project key is required');
      }
      return apiClient.getFileProgress(projectKey);
    },
    enabled: !!projectKey,
    refetchInterval: (data) => {
      // Faster polling if there are files being processed
      const hasActiveProcessing = data && (
        data.processing_files > 0 || 
        data.pending_files > 0
      );
      return hasActiveProcessing ? 2000 : 10000; // 2s vs 10s
    },
    staleTime: 1000, // Consider data stale after 1 second
  });
};

export const useFileProgressPercentage = (projectKey?: string) => {
  const { data: progress, ...rest } = useFileProgress(projectKey);
  
  return {
    ...rest,
    data: progress,
    percentage: progress?.progress_percentage || 0,
    isComplete: progress?.total_files > 0 && progress?.processed_files === progress?.total_files,
    hasErrors: (progress?.failed_files || 0) > 0,
    isProcessing: (progress?.processing_files || 0) > 0 || (progress?.pending_files || 0) > 0,
  };
};

// Hook for aggregated progress across all projects (for dashboard stats)
export const useAggregatedFileProgress = () => {
  return useQuery({
    queryKey: ['aggregated-file-progress'],
    queryFn: async () => {
      // Get all projects first
      const projects = await apiClient.getProjects();
      
      let totalFiles = 0;
      let totalProcessedFiles = 0;
      let totalFailedFiles = 0;
      let totalPendingFiles = 0;
      let totalProcessingFiles = 0;
      
      // Get progress for each project and sum them up
      for (const project of projects) {
        try {
          const progress = await apiClient.getFileProgress(project.key);
          totalFiles += progress.total_files;
          totalProcessedFiles += progress.processed_files;
          totalFailedFiles += progress.failed_files;
          totalPendingFiles += progress.pending_files;
          totalProcessingFiles += progress.processing_files;
        } catch (error) {
          // If no progress data for a project, ignore it
          console.warn(`No progress data for project ${project.key}`);
        }
      }
      
      return {
        totalFiles,
        totalProcessedFiles,
        totalFailedFiles,
        totalPendingFiles,
        totalProcessingFiles
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
  });
};