
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, UploadJob } from '@/lib/api';
import { toast } from 'sonner';

export const useUploads = () => {
  return useQuery({
    queryKey: ['uploads'],
    queryFn: () => apiClient.getUploads(),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

export const useFileProgress = () => {
  return useQuery({
    queryKey: ['file-progress'],
    queryFn: async () => {
      // Get progress for all projects and sum up the processed files
      const uploads = await apiClient.getUploads();
      const projectKeys = [...new Set(uploads.map(upload => upload.project_key))];
      
      let totalProcessedFiles = 0;
      for (const projectKey of projectKeys) {
        try {
          const progress = await apiClient.getFileProgress(projectKey);
          totalProcessedFiles += progress.processed_files;
        } catch (error) {
          // If no progress data for a project, ignore it
        }
      }
      
      return { totalProcessedFiles };
    },
    refetchInterval: 5000,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectKey, file }: { projectKey: string; file: File }) =>
      apiClient.uploadFile(projectKey, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['file-progress'] });
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload file');
    },
  });
};
