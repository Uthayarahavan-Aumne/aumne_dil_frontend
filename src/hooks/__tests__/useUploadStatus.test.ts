import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUploadStatus } from '../useUploadStatus';
import { apiClient } from '@/lib/api';
import { createMockUploadJobs, createFetchMock, setupFakeTimers } from '@/test/utils';
import { POLLING_CONFIG, STATUS_PAGE_CONFIG } from '@/lib/config';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    getUploads: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

// Setup fake timers for all tests
setupFakeTimers();

describe('useUploadStatus', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('automatic polling', () => {
    it('should poll at default interval when auto-refresh is enabled', async () => {
      const mockUploads = createMockUploadJobs(2, { status: 'completed' });
      mockApiClient.getUploads.mockResolvedValue(mockUploads);

      const { result } = renderHook(
        () => useUploadStatus({ enableAutoRefresh: true }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUploads);
      });

      // Verify initial call
      expect(mockApiClient.getUploads).toHaveBeenCalledTimes(1);

      // Fast forward to trigger polling
      vi.advanceTimersByTime(STATUS_PAGE_CONFIG.AUTO_REFRESH_INTERVAL);

      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(2);
      });
    });

    it('should use fast polling when there are active jobs', async () => {
      const mockUploads = createMockUploadJobs(2, { status: 'processing' });
      mockApiClient.getUploads.mockResolvedValue(mockUploads);

      const { result } = renderHook(
        () => useUploadStatus({ enableAutoRefresh: true }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUploads);
      });

      // Fast forward by active polling interval
      vi.advanceTimersByTime(POLLING_CONFIG.ACTIVE_POLLING_INTERVAL);

      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(2);
      });
    });

    it('should not poll when auto-refresh is disabled', async () => {
      const mockUploads = createMockUploadJobs(1);
      mockApiClient.getUploads.mockResolvedValue(mockUploads);

      renderHook(
        () => useUploadStatus({ enableAutoRefresh: false }),
        { wrapper }
      );

      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(1);
      });

      // Fast forward beyond polling interval
      vi.advanceTimersByTime(STATUS_PAGE_CONFIG.AUTO_REFRESH_INTERVAL * 2);

      // Should not have made additional calls
      expect(mockApiClient.getUploads).toHaveBeenCalledTimes(1);
    });
  });

  describe('manual refresh', () => {
    it('should allow manual refresh', async () => {
      const mockUploads = createMockUploadJobs(1);
      mockApiClient.getUploads.mockResolvedValue(mockUploads);

      const { result } = renderHook(
        () => useUploadStatus({ enableAutoRefresh: false }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUploads);
      });

      expect(mockApiClient.getUploads).toHaveBeenCalledTimes(1);

      // Trigger manual refresh
      await result.current.refetch();

      expect(mockApiClient.getUploads).toHaveBeenCalledTimes(2);
    });

    it('should handle refresh debouncing', async () => {
      const mockUploads = createMockUploadJobs(1);
      mockApiClient.getUploads.mockResolvedValue(mockUploads);

      const { result } = renderHook(
        () => useUploadStatus({ enableAutoRefresh: false }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUploads);
      });

      // Trigger multiple rapid refreshes
      result.current.refetch();
      result.current.refetch();
      result.current.refetch();

      // Should only have made 2 calls (initial + 1 refresh)
      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(2);
      });
    });

    it('should track refreshing state correctly', async () => {
      const mockUploads = createMockUploadJobs(1);
      mockApiClient.getUploads.mockResolvedValue(mockUploads);

      const { result } = renderHook(
        () => useUploadStatus({ enableAutoRefresh: false }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
        expect(result.current.canRefresh).toBe(true);
      });

      // Start refresh
      const refreshPromise = result.current.refetch();

      // Should be in refreshing state
      expect(result.current.isRefreshing).toBe(true);
      expect(result.current.canRefresh).toBe(false);

      await refreshPromise;

      // Fast forward through debounce delay
      vi.advanceTimersByTime(POLLING_CONFIG.REFRESH_DEBOUNCE_DELAY);

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
        expect(result.current.canRefresh).toBe(true);
      });
    });
  });

  describe('project filtering', () => {
    it('should filter uploads by project key when provided', async () => {
      const allUploads = [
        ...createMockUploadJobs(2, { project_key: 'project-a' }),
        ...createMockUploadJobs(1, { project_key: 'project-b' }),
      ];
      const expectedUploads = allUploads.filter(u => u.project_key === 'project-a');
      
      mockApiClient.getUploads.mockResolvedValue(allUploads);

      const { result } = renderHook(
        () => useUploadStatus({ projectKey: 'project-a' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(expectedUploads);
        expect(result.current.data).toHaveLength(2);
      });
    });

    it('should return all uploads when no project key is provided', async () => {
      const allUploads = createMockUploadJobs(3, { project_key: 'project-a' });
      mockApiClient.getUploads.mockResolvedValue(allUploads);

      const { result } = renderHook(
        () => useUploadStatus(),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(allUploads);
        expect(result.current.data).toHaveLength(3);
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error');
      mockApiClient.getUploads.mockRejectedValue(error);

      const { result } = renderHook(
        () => useUploadStatus({ enableAutoRefresh: false }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.data).toBeUndefined();
      });
    });

    it('should retry failed requests up to configured limit', async () => {
      mockApiClient.getUploads
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockRejectedValueOnce(new Error('Third failure'))
        .mockResolvedValue([]);

      renderHook(
        () => useUploadStatus({ enableAutoRefresh: false }),
        { wrapper }
      );

      // Wait for retries to complete
      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(4); // Initial + 3 retries
      }, { timeout: 5000 });
    });
  });

  describe('data sorting', () => {
    it('should sort uploads by creation date, most recent first', async () => {
      const now = new Date();
      const uploads = [
        createMockUploadJobs(1, { 
          id: 'old',
          created_at: new Date(now.getTime() - 3600000).toISOString() // 1 hour ago
        })[0],
        createMockUploadJobs(1, { 
          id: 'new',
          created_at: now.toISOString() // now
        })[0],
        createMockUploadJobs(1, { 
          id: 'middle',
          created_at: new Date(now.getTime() - 1800000).toISOString() // 30 min ago
        })[0],
      ];

      mockApiClient.getUploads.mockResolvedValue(uploads);

      const { result } = renderHook(
        () => useUploadStatus(),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([
          expect.objectContaining({ id: 'new' }),
          expect.objectContaining({ id: 'middle' }),
          expect.objectContaining({ id: 'old' }),
        ]);
      });
    });
  });
});