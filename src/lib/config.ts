/**
 * Configuration constants for the application
 */

// Upload status polling configuration
export const POLLING_CONFIG = {
  // Polling interval when there are active jobs (queued/processing)
  ACTIVE_POLLING_INTERVAL: 2000, // 2 seconds
  
  // Polling interval when all jobs are idle (completed/failed)
  IDLE_POLLING_INTERVAL: 10000, // 10 seconds
  
  // Default polling interval for dedicated status page
  DEFAULT_POLLING_INTERVAL: 30000, // 30 seconds as specified in requirements
  
  // Debounce delay for manual refresh button
  REFRESH_DEBOUNCE_DELAY: 1000, // 1 second
} as const;

// Status page configuration
export const STATUS_PAGE_CONFIG = {
  // Auto-refresh polling interval (configurable as per requirements)
  AUTO_REFRESH_INTERVAL: POLLING_CONFIG.DEFAULT_POLLING_INTERVAL,
  
  // Enable/disable auto-refresh
  AUTO_REFRESH_ENABLED: true,
  
  // Maximum number of retries for failed requests
  MAX_RETRY_ATTEMPTS: 3,
} as const;