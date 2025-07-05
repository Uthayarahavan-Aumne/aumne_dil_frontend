import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, DatabaseHealth, DatabaseStatus } from '@/lib/api';

// Manual batch health check hook - checks all projects once and populates individual caches
export const useDatabaseHealth = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['database-health'],
    queryFn: async () => {
      const results = await apiClient.getDatabaseHealth();
      
      // Populate individual project health caches with improved status categorization
      results.forEach(result => {
        const improvedStatus = categorizeStatusFromError(result.status, result.error_message);
        
        const enhancedResult = {
          ...result,
          status: improvedStatus
        };
        
        // Set data in individual project cache
        queryClient.setQueryData(['project-database-health', result.project_key], enhancedResult);
      });
      
      // Invalidate computed summary to trigger update
      queryClient.invalidateQueries({ 
        queryKey: ['database-health-summary-computed'],
        exact: true 
      });
      
      
      return results;
    },
    enabled: false, // Manual trigger only
    staleTime: Infinity, // Data never goes stale - only check when manually triggered
    retry: (failureCount, error: any) => {
      // Don't retry on server errors (500+)
      if (error?.response?.status >= 500) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Computed summary hook that derives data from individual project health
export const useDatabaseHealthSummary = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['database-health-summary-computed'],
    queryFn: () => {
      
      // Get all individual project health data from cache
      const queryCache = queryClient.getQueryCache();
      const healthQueries = queryCache.findAll({ 
        predicate: (query) => query.queryKey[0] === 'project-database-health' 
      });
      
      let totalDatabases = 0;
      let activeDatabases = 0;
      let errorDatabases = 0;
      let checkingDatabases = 0;
      
      healthQueries.forEach(query => {
        const data = query.state.data as DatabaseHealth | undefined;
        if (data) {
          totalDatabases++;
          
          switch (data.status) {
            case 'active':
              activeDatabases++;
              break;
            case 'error':
              errorDatabases++;
              break;
            case 'checking':
              checkingDatabases++;
              break;
            default:
              // Fallback for any unexpected status
              errorDatabases++;
              break;
          }
        }
      });
      
      const summary = {
        total_databases: totalDatabases,
        active_databases: activeDatabases,
        error_databases: errorDatabases,
        checking_databases: checkingDatabases,
      };
      
      return summary;
    },
    staleTime: 0, // Always recompute when requested
    refetchInterval: 1000, // Refetch every second to catch updates
  });
};

// Removed status debouncing - no longer needed with one-time checks

// Helper function to check if an error is a connection issue (API busy, network timeout, etc.)
const isConnectionError = (status: DatabaseStatus, errorMessage?: string): boolean => {
  if (!errorMessage) return false;
  
  const connectionErrors = [
    'database instance is not accessible',
    'database instance is unreachable', 
    'connection refused',
    'connection timeout',
    'network error',
    'failed to obtain connection',
    'connection test failed',
    'host unreachable',
    'timeout',
    'refused',
    'server error',
    'service unavailable',
    'api busy',
    'temporary failure',
    'network timeout'
  ];
  
  const lowerErrorMessage = errorMessage.toLowerCase();
  return connectionErrors.some(error => lowerErrorMessage.includes(error));
};

// Simplified categorization: maps to 'active', 'error', or preserves 'checking'
const categorizeStatusFromError = (status: DatabaseStatus, errorMessage?: string): DatabaseStatus => {
  
  // If status is already active, keep it active
  if (status === 'active') {
    return 'active';
  }
  
  // If status is checking, preserve it (used during retry process)
  if (status === 'checking') {
    return 'checking';
  }
  
  // Everything else becomes error - this includes:
  // - Authentication/credential errors
  // - Connection errors (after retries)
  // - Unknown errors
  // - Inactive status
  // - Any other error condition
  return 'error';
};

export const useProjectDatabaseHealth = (projectKey: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['project-database-health', projectKey],
    queryFn: async () => {
      // Set initial checking status
      const checkingResult = {
        project_key: projectKey,
        project_name: '',
        database_uri: '',
        status: 'checking' as DatabaseStatus,
        response_time_ms: 0,
        error_message: null,
        last_checked: new Date().toISOString()
      };
      
      // Update cache immediately with checking status
      queryClient.setQueryData(['project-database-health', projectKey], checkingResult);
      queryClient.invalidateQueries({ 
        queryKey: ['database-health-summary-computed'],
        exact: true 
      });
      
      
      let result = await apiClient.getProjectDatabaseHealth(projectKey);
      let retryCount = 0;
      const maxRetries = 3;
      
      // Keep retrying if we get connection errors to ensure factual information
      while (retryCount < maxRetries) {
        const isConnectionIssue = isConnectionError(result.status, result.error_message);
        
        if (!isConnectionIssue) {
          // Not a connection issue, break out of retry loop
          break;
        }
        
        
        if (retryCount < maxRetries - 1) {
          // Wait before retry (exponential backoff: 2s, 4s, 8s)
          const waitTime = Math.pow(2, retryCount + 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Retry the API call
          result = await apiClient.getProjectDatabaseHealth(projectKey);
          retryCount++;
        } else {
          // Max retries reached, still connection issue - mark as error
          break;
        }
      }
      
      // Categorize the final result (active, error, but never checking at this point)
      const finalStatus = categorizeStatusFromError(result.status, result.error_message);
      const resultWithFinalStatus = {
        ...result,
        status: finalStatus
      };
      
      
      // Always invalidate computed summary to ensure it updates
      queryClient.invalidateQueries({ 
        queryKey: ['database-health-summary-computed'],
        exact: true 
      });
      
      
      return resultWithFinalStatus;
    },
    enabled: !!projectKey,
    staleTime: Infinity, // Never refetch automatically - only on manual trigger
    retry: false, // Disable React Query retry since we handle retries manually
  });
};
// Hook to manually refresh database health when credentials are updated
export const useRefreshDatabaseHealth = () => {
  const queryClient = useQueryClient();
  
  const refreshProjectHealth = (projectKey: string) => {
    // Invalidate and refetch the specific project's health
    queryClient.invalidateQueries({ 
      queryKey: ['project-database-health', projectKey] 
    });
    // Also refresh the computed summary
    queryClient.invalidateQueries({ 
      queryKey: ['database-health-summary-computed'] 
    });
  };
  
  const refreshAllHealth = () => {
    // Invalidate all health-related queries
    queryClient.invalidateQueries({ 
      queryKey: ['project-database-health'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['database-health-summary-computed'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['database-health'] 
    });
  };
  
  const triggerBatchHealthCheck = () => {
    // Manually trigger the batch health check
    queryClient.fetchQuery({ 
      queryKey: ['database-health'],
    });
  };
  
  return { refreshProjectHealth, refreshAllHealth, triggerBatchHealthCheck };
};
