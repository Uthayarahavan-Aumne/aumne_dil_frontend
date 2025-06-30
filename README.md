# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e6637eef-64dc-4566-8fbb-1b432e1963e8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e6637eef-64dc-4566-8fbb-1b432e1963e8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e6637eef-64dc-4566-8fbb-1b432e1963e8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Upload Status Refresh Mechanism

This application features an advanced upload status monitoring system with configurable automatic polling and manual refresh capabilities.

### Automatic Polling Configuration

The polling behavior is configured in `/src/lib/config.ts`:

```typescript
export const POLLING_CONFIG = {
  // Polling interval when there are active jobs (queued/processing)
  ACTIVE_POLLING_INTERVAL: 2000, // 2 seconds
  
  // Polling interval when all jobs are idle (completed/failed)
  IDLE_POLLING_INTERVAL: 10000, // 10 seconds
  
  // Default polling interval for dedicated status page
  DEFAULT_POLLING_INTERVAL: 30000, // 30 seconds
  
  // Debounce delay for manual refresh button
  REFRESH_DEBOUNCE_DELAY: 1000, // 1 second
};
```

### Polling Behavior

#### Smart Polling Strategy

The system implements an intelligent polling strategy that adapts based on job activity:

1. **Active Jobs Present**: When uploads with status `queued` or `processing` exist, polling occurs every **2 seconds** for real-time updates
2. **No Active Jobs**: When all jobs are `completed` or `failed`, polling slows to the configured interval (default **30 seconds**)
3. **Disabled Auto-refresh**: Polling can be completely disabled by setting `enableAutoRefresh: false`

#### Upload Status Page (`/uploads`)

- **Default Interval**: 30 seconds (configurable)
- **Fast Polling**: Automatically switches to 2-second intervals when active jobs are detected
- **Visual Indicator**: Shows "Fast polling active" badge when using accelerated polling
- **Configuration Panel**: Toggle-able settings panel showing current polling configuration

### Manual Refresh Controls

#### Refresh Button Behavior

- **Debounced Requests**: Multiple rapid clicks are debounced to prevent API spam
- **Loading States**: Button shows spinner and "Refreshing..." text during requests
- **Disabled During Refresh**: Button is disabled while refresh is in progress
- **Error Recovery**: Failed refreshes can be retried immediately

### Usage Examples

#### Basic Upload Status Monitoring

```tsx
import { UploadStatusPage } from '@/pages/UploadStatusPage';

// Full-featured status page with automatic polling
<UploadStatusPage />

// Project-specific status monitoring
<UploadStatusPage projectKey="my-project" />
```

#### Custom Polling Configuration

```tsx
import { useUploadStatus } from '@/hooks/useUploadStatus';

const MyComponent = () => {
  const {
    data: uploads,
    isRefreshing,
    refetch,
    canRefresh
  } = useUploadStatus({
    projectKey: "my-project",
    enableAutoRefresh: true,
    pollingInterval: 15000 // Custom 15-second interval
  });
  
  return (
    <div>
      <button 
        onClick={refetch} 
        disabled={!canRefresh}
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      {/* Upload list UI */}
    </div>
  );
};
```

### Testing

The polling and refresh functionality is comprehensively tested:

```bash
# Run tests
npm test

# Run hook tests specifically
npm test -- useUploadStatus

# Run page component tests
npm test -- UploadStatusPage
```

#### Test Scenarios Covered

- ✅ **Automatic polling updates job status**: Verifies status transitions from queued → completed
- ✅ **Manual refresh button updates statuses**: Tests immediate refresh on button click  
- ✅ **Fast polling activation**: Confirms 2-second polling with active jobs
- ✅ **Debounced refresh**: Prevents duplicate requests from rapid clicking
- ✅ **Error handling**: Tests network failures and retry mechanisms
- ✅ **Loading states**: Validates user feedback during operations

### Troubleshooting

**Polling Not Working**
- Verify backend is running on port 8000
- Check browser network tab for API call errors
- Ensure `enableAutoRefresh` is set to `true`

**Refresh Button Disabled**
- Wait for current refresh to complete
- Check for network errors in console
- Verify API endpoints are accessible
