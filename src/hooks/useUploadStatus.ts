import { useQuery } from '@tanstack/react-query';
import React, { useState, useCallback, useRef } from 'react';
import { apiClient, UploadJob } from '@/lib/api';
import { POLLING_CONFIG, STATUS_PAGE_CONFIG } from '@/lib/config';

interface UseUploadStatusOptions {
  projectKey?: string;
  pollingInterval?: number;
  enableAutoRefresh?: boolean;
}

interface UseUploadStatusReturn {
  data: UploadJob[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isRefreshing: boolean;
  refetch: () => Promise<void>;
  canRefresh: boolean;
}

export const useUploadStatus = (options: UseUploadStatusOptions = {}): UseUploadStatusReturn => {
  const {
    projectKey,
    pollingInterval = STATUS_PAGE_CONFIG.AUTO_REFRESH_INTERVAL,
    enableAutoRefresh = STATUS_PAGE_CONFIG.AUTO_REFRESH_ENABLED,
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['upload-status', projectKey],
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
    refetchInterval: enableAutoRefresh ? (data) => {
      // Smart polling: faster for active jobs, slower for idle
      const hasActiveJobs = data?.some(job => 
        job.status === 'queued' || job.status === 'processing'
      );
      
      // If we have active jobs, use faster polling, otherwise use configured interval
      return hasActiveJobs 
        ? POLLING_CONFIG.ACTIVE_POLLING_INTERVAL 
        : pollingInterval;
    } : false,
    staleTime: 0, // Always consider data stale for real-time updates
    retry: STATUS_PAGE_CONFIG.MAX_RETRY_ATTEMPTS,
  });

  // Debounced manual refresh function
  const refetch = useCallback(async () => {
    // Prevent duplicate calls if already refreshing
    if (isRefreshing) {
      return;
    }

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    setIsRefreshing(true);

    try {
      await queryRefetch();
    } finally {
      // Use timeout to ensure minimum loading state duration for UX
      refreshTimeoutRef.current = setTimeout(() => {
        setIsRefreshing(false);
      }, POLLING_CONFIG.REFRESH_DEBOUNCE_DELAY);
    }
  }, [isRefreshing, queryRefetch]);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    data,
    isLoading,
    error,
    isRefreshing,
    refetch,
    canRefresh: !isRefreshing && !isLoading,
  };
};

// Keep the existing hook for backward compatibility
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
      return hasActiveJobs ? POLLING_CONFIG.ACTIVE_POLLING_INTERVAL : POLLING_CONFIG.IDLE_POLLING_INTERVAL;
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