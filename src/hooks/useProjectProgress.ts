import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useProjectProgress = (projectKey: string) => {
  return useQuery({
    queryKey: ['project-progress', projectKey],
    queryFn: () => apiClient.getFileProgress(projectKey),
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!projectKey,
    retry: (failureCount, error: any) => {
      // Don't retry on server errors (500+)
      if (error?.response?.status >= 500) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};