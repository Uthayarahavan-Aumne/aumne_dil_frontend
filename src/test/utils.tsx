import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { UploadJob } from '@/lib/api';

// Mock data generators
export const createMockUploadJob = (overrides: Partial<UploadJob> = {}): UploadJob => ({
  id: 'mock-id-' + Math.random().toString(36).substr(2, 9),
  project_key: 'test-project',
  file_name: 'test-file.zip',
  status: 'queued',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockUploadJobs = (count: number, overrides: Partial<UploadJob> = {}): UploadJob[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockUploadJob({
      id: `mock-id-${index}`,
      file_name: `test-file-${index}.zip`,
      ...overrides,
    })
  );
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock API responses
export const mockApiResponses = {
  uploads: {
    empty: [],
    queued: [
      createMockUploadJob({ status: 'queued' }),
    ],
    processing: [
      createMockUploadJob({ status: 'processing' }),
    ],
    completed: [
      createMockUploadJob({ status: 'completed' }),
    ],
    failed: [
      createMockUploadJob({ 
        status: 'failed', 
        error_message: 'Processing failed due to invalid VXML format' 
      }),
    ],
    mixed: [
      createMockUploadJob({ status: 'completed', file_name: 'completed-file.zip' }),
      createMockUploadJob({ status: 'processing', file_name: 'processing-file.zip' }),
      createMockUploadJob({ status: 'queued', file_name: 'queued-file.zip' }),
      createMockUploadJob({ 
        status: 'failed', 
        file_name: 'failed-file.zip',
        error_message: 'Invalid VXML structure' 
      }),
    ],
  },
};

// Helper to create fetch mock
export const createFetchMock = (response: any, options: { delay?: number; shouldFail?: boolean } = {}) => {
  const { delay = 0, shouldFail = false } = options;
  
  return vi.fn().mockImplementation(() => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Network error'));
        } else {
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(response),
            headers: {
              get: (name: string) => name === 'content-type' ? 'application/json' : null,
            },
          });
        }
      }, delay);
    })
  );
};

// Fake timers helper
export const setupFakeTimers = () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
};