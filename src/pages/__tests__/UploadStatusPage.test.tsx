import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadStatusPage } from '../UploadStatusPage';
import { apiClient } from '@/lib/api';
import { 
  renderWithProviders, 
  mockApiResponses, 
  createMockUploadJob,
  setupFakeTimers,
} from '@/test/utils';
import { STATUS_PAGE_CONFIG, POLLING_CONFIG } from '@/lib/config';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    getUploads: vi.fn(),
  },
}));

// Mock the ProcessingTimeline component to avoid complex dependencies
vi.mock('@/components/processing/ProcessingTimeline', () => ({
  ProcessingTimeline: ({ upload }: { upload: any }) => (
    <div data-testid="processing-timeline">
      Timeline for {upload.file_name}
    </div>
  ),
}));

// Mock the formatDateTime utility
vi.mock('@/lib/utils', () => ({
  formatDateTime: (date: string) => new Date(date).toLocaleDateString(),
}));

const mockApiClient = vi.mocked(apiClient);

// Setup fake timers for polling tests
setupFakeTimers();

describe('UploadStatusPage', () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario: Automatic polling updates job status', () => {
    it('should update UI when job status changes from queued to completed', async () => {
      // Given I am on the /uploads page
      // And the first GET /uploads response returns a job with status: "queued"
      const queuedJob = createMockUploadJob({ 
        id: 'test-job',
        status: 'queued',
        file_name: 'test-file.zip'
      });
      
      mockApiClient.getUploads.mockResolvedValueOnce([queuedJob]);

      renderWithProviders(<UploadStatusPage />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('test-file.zip')).toBeInTheDocument();
        expect(screen.getByText('Queued')).toBeInTheDocument();
      });

      // And subsequent GET /uploads response (after the polling interval) returns the same job with status: "completed"
      const completedJob = { ...queuedJob, status: 'completed' as const };
      mockApiClient.getUploads.mockResolvedValue([completedJob]);

      // When the polling interval elapses
      vi.advanceTimersByTime(STATUS_PAGE_CONFIG.AUTO_REFRESH_INTERVAL);

      // Then the UI updates to show the job's status as completed
      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.queryByText('Queued')).not.toBeInTheDocument();
      });
    });

    it('should use fast polling when there are active jobs', async () => {
      const processingJob = createMockUploadJob({ status: 'processing' });
      mockApiClient.getUploads.mockResolvedValue([processingJob]);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(1);
      });

      // Should poll faster for active jobs
      vi.advanceTimersByTime(POLLING_CONFIG.ACTIVE_POLLING_INTERVAL);

      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(2);
      });

      // Should see "Fast polling active" indicator
      expect(screen.getByText('Fast polling active')).toBeInTheDocument();
    });
  });

  describe('Scenario: Manual refresh button updates statuses', () => {
    it('should update UI when refresh button is clicked', async () => {
      // Given I am on the /uploads page
      // And the current job list shows a job with status: "processing"
      const processingJob = createMockUploadJob({ 
        id: 'test-job',
        status: 'processing',
        file_name: 'test-file.zip'
      });
      
      mockApiClient.getUploads.mockResolvedValueOnce([processingJob]);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getByText('test-file.zip')).toBeInTheDocument();
        expect(screen.getByText('Processing')).toBeInTheDocument();
      });

      // And the next GET /uploads response returns that job with status: "failed"
      const failedJob = { 
        ...processingJob, 
        status: 'failed' as const,
        error_message: 'Processing failed due to invalid VXML format'
      };
      mockApiClient.getUploads.mockResolvedValue([failedJob]);

      // When I click the "Refresh" button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Then the UI updates to show the job's status as failed
      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(screen.queryByText('Processing')).not.toBeInTheDocument();
        expect(screen.getByText('Processing failed due to invalid VXML format')).toBeInTheDocument();
      });
    });

    it('should show loading state during manual refresh', async () => {
      mockApiClient.getUploads.mockResolvedValue(mockApiResponses.uploads.completed);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      // Mock delayed response
      mockApiClient.getUploads.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockApiResponses.uploads.completed), 100))
      );

      await user.click(refreshButton);

      // Should show refreshing state
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
      expect(refreshButton).toBeDisabled();
    });

    it('should prevent multiple simultaneous refresh requests', async () => {
      mockApiClient.getUploads.mockResolvedValue(mockApiResponses.uploads.empty);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      // Click multiple times rapidly
      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);

      // Should only make 2 API calls (initial + 1 refresh)
      await waitFor(() => {
        expect(mockApiClient.getUploads).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('UI functionality', () => {
    it('should display upload statistics correctly', async () => {
      mockApiClient.getUploads.mockResolvedValue(mockApiResponses.uploads.mixed);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        // Check stats
        expect(screen.getByText('4')).toBeInTheDocument(); // Total
        expect(screen.getByText('1')).toBeInTheDocument(); // Completed
        expect(screen.getByText('2')).toBeInTheDocument(); // Active (processing + queued)
        expect(screen.getByText('1')).toBeInTheDocument(); // Failed
      });
    });

    it('should filter uploads by search term', async () => {
      mockApiClient.getUploads.mockResolvedValue([
        createMockUploadJob({ file_name: 'important-data.zip' }),
        createMockUploadJob({ file_name: 'test-file.zip' }),
      ]);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getByText('important-data.zip')).toBeInTheDocument();
        expect(screen.getByText('test-file.zip')).toBeInTheDocument();
      });

      // Search for 'important'
      const searchInput = screen.getByPlaceholderText('Search files...');
      await user.type(searchInput, 'important');

      // Should only show matching file
      expect(screen.getByText('important-data.zip')).toBeInTheDocument();
      expect(screen.queryByText('test-file.zip')).not.toBeInTheDocument();
    });

    it('should filter uploads by status', async () => {
      mockApiClient.getUploads.mockResolvedValue(mockApiResponses.uploads.mixed);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getAllByText(/file\.zip/)).toHaveLength(4);
      });

      // Filter by 'Failed' status
      const statusFilter = screen.getByRole('combobox');
      await user.click(statusFilter);
      
      const failedOption = screen.getByRole('option', { name: 'Failed' });
      await user.click(failedOption);

      // Should only show failed uploads
      await waitFor(() => {
        expect(screen.getByText('failed-file.zip')).toBeInTheDocument();
        expect(screen.queryByText('completed-file.zip')).not.toBeInTheDocument();
      });
    });

    it('should expand and collapse upload details', async () => {
      const upload = createMockUploadJob({ file_name: 'test-file.zip' });
      mockApiClient.getUploads.mockResolvedValue([upload]);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getByText('test-file.zip')).toBeInTheDocument();
      });

      // Click expand button
      const expandButton = screen.getByRole('button', { name: '' }); // Chevron button
      await user.click(expandButton);

      // Should show timeline
      await waitFor(() => {
        expect(screen.getByTestId('processing-timeline')).toBeInTheDocument();
        expect(screen.getByText('Timeline for test-file.zip')).toBeInTheDocument();
      });

      // Click collapse button
      await user.click(expandButton);

      // Should hide timeline
      await waitFor(() => {
        expect(screen.queryByTestId('processing-timeline')).not.toBeInTheDocument();
      });
    });

    it('should show configuration panel when settings button is clicked', async () => {
      mockApiClient.getUploads.mockResolvedValue([]);

      renderWithProviders(<UploadStatusPage />);

      // Click settings button
      const settingsButton = screen.getByRole('button', { name: '' }); // Settings icon
      await user.click(settingsButton);

      // Should show configuration panel
      expect(screen.getByText('Refresh Configuration')).toBeInTheDocument();
      expect(screen.getByText('30 seconds')).toBeInTheDocument(); // Auto-refresh interval
      expect(screen.getByText('2 seconds (when processing)')).toBeInTheDocument(); // Active polling
    });
  });

  describe('Error handling', () => {
    it('should display error message and retry button on API failure', async () => {
      const error = new Error('Network connection failed');
      mockApiClient.getUploads.mockRejectedValue(error);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load upload status/)).toBeInTheDocument();
        expect(screen.getByText('Network connection failed')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('should show empty state when no uploads exist', async () => {
      mockApiClient.getUploads.mockResolvedValue([]);

      renderWithProviders(<UploadStatusPage />);

      await waitFor(() => {
        expect(screen.getByText('No uploads found matching your criteria')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      mockApiClient.getUploads.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      renderWithProviders(<UploadStatusPage />);

      expect(screen.getByText('Loading upload status...')).toBeInTheDocument();
    });
  });

  describe('Project filtering', () => {
    it('should filter uploads by project key when provided', async () => {
      const allUploads = [
        createMockUploadJob({ project_key: 'project-a', file_name: 'file-a.zip' }),
        createMockUploadJob({ project_key: 'project-b', file_name: 'file-b.zip' }),
      ];
      mockApiClient.getUploads.mockResolvedValue(allUploads);

      renderWithProviders(<UploadStatusPage projectKey="project-a" />);

      await waitFor(() => {
        expect(screen.getByText('file-a.zip')).toBeInTheDocument();
        expect(screen.queryByText('file-b.zip')).not.toBeInTheDocument();
      });
    });
  });
});