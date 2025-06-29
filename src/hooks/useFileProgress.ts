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