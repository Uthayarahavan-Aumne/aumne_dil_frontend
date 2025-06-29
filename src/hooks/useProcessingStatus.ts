
import { useQuery } from '@tanstack/react-query';
import { apiClient, UploadJob } from '@/lib/api';

export const useProcessingStatus = (projectKey?: string) => {
  return useQuery({
    queryKey: ['processing-status', projectKey],
    queryFn: async () => {
      const uploads = await apiClient.getUploads();
      return projectKey 
        ? uploads.filter(upload => upload.project_key === projectKey)
        : uploads;
    },
    refetchInterval: (data) => {
      // Faster polling if there are active processing jobs
      const hasActiveJobs = data?.some(job => 
        job.status === 'queued' || job.status === 'processing'
      );
      return hasActiveJobs ? 2000 : 10000; // 2s vs 10s
    },
  });
};

export const useProcessingHistory = (projectKey?: string) => {
  return useQuery({
    queryKey: ['processing-history', projectKey],
    queryFn: async () => {
      const uploads = await apiClient.getUploads();
      const filtered = projectKey 
        ? uploads.filter(upload => upload.project_key === projectKey)
        : uploads;
      
      // Sort by creation date, most recent first
      return filtered.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
