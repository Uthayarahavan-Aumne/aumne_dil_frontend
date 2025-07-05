
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Project, CreateProjectData } from '@/lib/api';
import { toast } from 'sonner';
import { useRefreshDatabaseHealth } from './useDatabaseHealth';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (key: string) => {
  return useQuery({
    queryKey: ['project', key],
    queryFn: () => apiClient.getProject(key),
    enabled: !!key,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create project');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { refreshProjectHealth } = useRefreshDatabaseHealth();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: Partial<CreateProjectData> }) =>
      apiClient.updateProject(key, data),
    onSuccess: (_, { key, data }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', key] });
      
      // If database config was updated, refresh health check to restart polling
      if (data.db_config) {
        refreshProjectHealth(key);
      }
      
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update project');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => apiClient.deleteProject(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete project');
    },
  });
};
