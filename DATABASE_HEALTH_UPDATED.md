# Updated Database Health Monitoring Documentation

## Database Health Monitoring (Updated 2025-06-30)

### Overview

The application includes a **simplified database health monitoring system** that tracks the connectivity status of Neo4j databases for each project. The system uses a **binary status model** with intelligent retry mechanisms to ensure factual information while optimizing performance.

### Simplified Health Status Types

The system now uses only **two distinct database health states** for maximum clarity:

1. **`active`** - Database is reachable and working correctly
2. **`error`** - Any problem including wrong credentials, network issues, or database unavailability

**Key Benefits:**
- **Clear user experience**: Database either works or it doesn't
- **Simplified logic**: No confusion between "inactive" vs "error"
- **Performance optimized**: One-time checks with retry mechanisms

### Smart Retry Strategy

#### Intelligent Retry Logic

The system implements robust retry mechanisms specifically for connection errors to ensure factual data:

```typescript
// Retry logic in useProjectDatabaseHealth
let retryCount = 0;
const maxRetries = 3;

while (retryCount < maxRetries) {
  const isConnectionIssue = isConnectionError(result.status, result.error_message);
  
  if (!isConnectionIssue) {
    break; // Not a connection issue, use result
  }
  
  if (retryCount < maxRetries - 1) {
    // Wait with exponential backoff: 2s, 4s, 8s
    const waitTime = Math.pow(2, retryCount + 1) * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    result = await apiClient.getProjectDatabaseHealth(projectKey);
    retryCount++;
  } else {
    break; // Max retries reached
  }
}
```

#### Retry Behavior for Connection Issues

| Attempt | Wait Time | Purpose |
|---------|-----------|----------|
| Initial | 0s | First check |
| Retry 1 | 2 seconds | Handle temporary glitches |
| Retry 2 | 4 seconds | Handle API busy states |
| Retry 3 | 8 seconds | Final attempt for accuracy |
| **Result** | - | **Mark as error if still failing** |

**Connection Issues Detected:**
- Database instance not accessible/unreachable
- Connection timeouts
- Network errors
- API busy/service unavailable
- Temporary failures

### No Periodic Polling

**Performance-First Approach:**
- ✅ **One-time checks** on component mount
- ✅ **Manual checks** after project edits
- ✅ **No continuous polling** - saves computational resources
- ✅ **Retry logic** ensures accurate status despite temporary issues

### Core Hooks (`/src/hooks/useDatabaseHealth.ts`)

**1. `useDatabaseHealth()`** - Manual batch health check
```typescript
const { triggerBatchHealthCheck } = useRefreshDatabaseHealth();
// Manually trigger health check for all projects
triggerBatchHealthCheck();
```

**2. `useDatabaseHealthSummary()`** - Dashboard statistics
```typescript
const { data: summary } = useDatabaseHealthSummary();
// Returns: { total_databases, active_databases, error_databases }
```

**3. `useProjectDatabaseHealth(projectKey)`** - Individual project monitoring
```typescript
const { data: dbHealth } = useProjectDatabaseHealth(project.key);
// Returns: { project_key, status, response_time_ms, error_message, last_checked }
```

**4. `useRefreshDatabaseHealth()`** - Manual refresh controls
```typescript
const { refreshProjectHealth, refreshAllHealth, triggerBatchHealthCheck } = useRefreshDatabaseHealth();

// Refresh specific project (triggers when credentials updated)
refreshProjectHealth(projectKey);

// Refresh all health data
refreshAllHealth();

// Trigger batch health check
triggerBatchHealthCheck();
```

### Backend API Integration

#### Health Summary Response
```json
{
  "total_databases": 2,
  "active_databases": 1,
  "error_databases": 1
}
```

### UI Components Integration

#### Status Badge Display (Simplified)
```typescript
{dbHealth ? (
  <StatusBadge 
    status={dbHealth.status === 'active' ? 'active' : 'error'} 
  />
) : (
  <StatusBadge status="loading" />
)}
```

#### Dashboard Statistics (Updated)
The dashboard displays:
- **Total Projects**: All configured projects
- **Files Processed**: Total files processed across all projects
- **Active Databases**: Successfully connected databases
- **Processing Jobs**: Currently processing files across all projects

### Performance Optimizations

#### 1. No Periodic Polling
- **One-time checks** only - no continuous API calls
- **Retry mechanisms** for connection issues ensure accuracy
- **Manual refresh** when projects are edited

#### 2. React Query Configuration
```typescript
// Cache configuration for one-time checks
staleTime: Infinity,    // Never refetch automatically
refetchInterval: false, // No periodic polling
```

#### 3. Connection Error Retry with Exponential Backoff
```typescript
// Manual retry logic for connection issues
const maxRetries = 3;
const waitTime = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s, 8s

// Disable React Query retry since we handle it manually
retry: false
```

### Integration with Project Management

#### Automatic Health Refresh on Project Updates

When a user creates or updates project credentials, the system automatically triggers a fresh health check:

```typescript
// In ProjectManagementModal component
if (mode === 'create') {
  const newProject = await createMutation.mutateAsync(formData);
  // Trigger health check for newly created project
  setTimeout(() => refreshProjectHealth(newProject.key), 500);
} else if (mode === 'edit' && project) {
  await updateMutation.mutateAsync({ key: project.key, data: formData });
  // Trigger health check for updated project (credentials may have changed)
  setTimeout(() => refreshProjectHealth(project.key), 500);
}
```

### Error Handling and User Feedback

#### Status Badge Colors and Labels
- **Active**: Green badge, "Active" text
- **Error**: Red badge, "Error" text (covers all failure cases)
- **Loading**: Gray badge, "Checking..." text (during initial check)

#### Visual Indicators
- **Active databases**: Green pulsing dot (●) with animation
- **Error databases**: Red circle (○) for any type of error

### Troubleshooting Health Monitoring

#### Common Issues

**1. Health checks not updating**
- Check backend API endpoints are accessible
- Verify React Query DevTools for cache status
- Ensure project keys are correct
- Check if manual refresh triggers work

**2. Active database count not updating**
- Verify summary hook is invalidated after individual health changes
- Check React Query cache invalidation logic
- Ensure database summary polling is working

**3. Retry mechanism not working**
- Check connection error detection patterns
- Verify exponential backoff timing
- Review manual retry implementation vs React Query retry

#### Development Testing

**Test different database states:**
```typescript
// Test with working database - should show as 'active'
const workingProject = {
  db_config: {
    uri: "neo4j+ssc://valid-host.databases.neo4j.io",
    user: "neo4j",
    password: "correct_password", 
    database: "neo4j"
  }
};

// Test with wrong credentials - should show as 'error' after categorization
const wrongCredentialsProject = {
  db_config: {
    uri: "neo4j+ssc://valid-host.databases.neo4j.io",
    user: "neo4j",
    password: "wrong_password",
    database: "neo4j"
  }
};

// Test with unreachable database - should show as 'error' after retries
const unreachableProject = {
  db_config: {
    uri: "neo4j+ssc://nonexistent.databases.neo4j.io",
    user: "neo4j",
    password: "any_password",
    database: "neo4j"
  }
};

// All non-active states become 'error' for simplified user experience
```

### Future Enhancements

#### Planned Improvements
1. **WebSocket integration** for real-time status updates
2. **Health history tracking** with charts
3. **Email/Slack notifications** for status changes
4. **Bulk health check operations**
5. **Advanced retry strategies** per error type

#### Performance Considerations
- **Connection pooling** on backend for health checks
- **Rate limiting** to prevent API overload
- **Circuit breaker pattern** for failing databases
- **One-time check strategy** to minimize API load
- **Retry mechanisms** only for connection issues

This **simplified health monitoring system** provides clear visibility into database connectivity while optimizing performance through **one-time checks with intelligent retry mechanisms** for factual accuracy.