
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

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectKey, file }: { projectKey: string; file: File }) =>
      apiClient.uploadFile(projectKey, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    },
  });
};
