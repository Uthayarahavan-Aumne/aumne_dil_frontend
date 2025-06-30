# ExampleFrontend - Complete Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Setup & Development](#setup--development)
6. [Backend Integration](#backend-integration)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Routing](#routing)
10. [API Integration](#api-integration)
11. [Real-time Features](#real-time-features)
12. [Database Health Monitoring](#database-health-monitoring)
13. [Error Handling](#error-handling)
14. [Styling & UI](#styling--ui)
15. [Development Workflow](#development-workflow)
16. [Deployment](#deployment)
17. [Troubleshooting](#troubleshooting)

## Project Overview

**ExampleFrontend** is a modern React application designed for VXML (Voice XML) file processing and project management. It provides a comprehensive dashboard for managing projects, uploading files, and monitoring processing status with real-time updates.

### Key Features
- **Project Management**: Full CRUD operations for VXML projects
- **File Upload**: Drag & drop interface with progress tracking
- **Real-time Monitoring**: Live status updates for file processing
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management with user feedback

## Architecture

The application follows a **modern React architecture** with these principles:
- **Component-based architecture** with reusable UI components
- **Custom hooks** for business logic separation
- **API layer abstraction** with centralized request handling
- **State management** using React Query for server state
- **Type-first development** with TypeScript

### Data Flow
```
API Layer → Custom Hooks → React Components → UI Updates
     ↓           ↓              ↓              ↓
Error Handling → Toast Notifications → Loading States → User Feedback
```

## Technology Stack

### Core Framework
- **React 18.3.1** - Frontend framework with concurrent features
- **TypeScript 5.5.3** - Type safety and developer experience
- **Vite 5.4.1** - Fast build tool and development server

### UI & Styling
- **shadcn/ui** - Modern component library built on Radix UI
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **Lucide React 0.462.0** - Beautiful SVG icons
- **Tailwind Animate** - CSS animations

### State Management & Data Fetching
- **TanStack Query 5.56.2** - Server state management with caching
- **React Hook Form 7.53.0** - Performant form management
- **Zod 3.23.8** - Schema validation

### Routing & Navigation
- **React Router DOM 6.26.2** - Client-side routing

### Additional Libraries
- **Sonner 1.5.0** - Toast notifications
- **Date-fns 3.6.0** - Date manipulation utilities
- **Recharts 2.12.7** - Chart components
- **Class Variance Authority** - Component variant styling

## Project Structure

```
examplefrontend/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components (35+ components)
│   │   ├── upload/         # Upload-specific components
│   │   ├── processing/     # Processing-related components
│   │   ├── Navbar.tsx      # Main navigation
│   │   ├── ProjectCard.tsx # Project display card
│   │   ├── StatsCard.tsx   # Statistics display
│   │   └── [modals...]     # Various modal components
│   ├── hooks/              # Custom React hooks
│   │   ├── useProjects.ts  # Project management hooks
│   │   ├── useUpload.ts    # File upload hooks
│   │   ├── useProcessingStatus.ts # Status monitoring
│   │   └── useUploadProgress.ts   # Progress tracking
│   ├── lib/                # Utilities and API client
│   │   ├── api.ts          # API client and interfaces
│   │   └── utils.ts        # Utility functions
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main dashboard
│   │   ├── ProjectList.tsx # Project management
│   │   └── NotFound.tsx    # 404 page
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── components.json         # shadcn/ui configuration
```

## Setup & Development

### Prerequisites
- **Node.js** (v16+ recommended) - [Install with nvm](https://github.com/nvm-sh/nvm)
- **npm** or **bun** (project uses bun.lockb)
- **Backend server** running on `http://localhost:8000`

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd examplefrontend
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using bun (recommended)
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173` (Vite default)
   - Backend required: `http://localhost:8000`

### Available Scripts

```json
{
  "dev": "vite",                    # Start development server
  "build": "vite build",            # Production build
  "build:dev": "vite build --mode development", # Development build
  "lint": "eslint .",               # Run ESLint
  "preview": "vite preview"         # Preview production build
}
```

### Development Environment Setup

1. **Configure your IDE** for TypeScript and React
2. **Install recommended extensions**:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript Importer

3. **Environment variables** (if needed):
   - Currently hardcoded to `http://localhost:8000`
   - For production, update API base URL in `/src/lib/api.ts`

## Backend Integration

### API Configuration
- **Base URL**: `http://localhost:8000`
- **Authentication**: Bearer token (`demo_token`)
- **Content Type**: JSON (except file uploads)

### Backend Requirements
The frontend expects a backend server with these endpoints:

#### Project Management
```
GET    /api/v1/projects         # List all projects
GET    /api/v1/projects/{key}   # Get project details
POST   /api/v1/projects         # Create project
PUT    /api/v1/projects/{key}   # Update project
DELETE /api/v1/projects/{key}   # Delete project
```

#### File Upload & Processing
```
POST   /upload                  # Upload VXML files
GET    /uploads                 # List upload jobs
GET    /health                  # Health check
```

### Data Models Expected by Frontend

**Project Interface:**
```typescript
interface Project {
  key: string;           # Unique identifier
  name: string;          # Display name
  db_config: {           # Neo4j configuration
    uri: string;
    user: string;
    password: string;
    database: string;
  };
  created_at: string;    # ISO timestamp
  updated_at: string;    # ISO timestamp
}
```

**Upload Job Interface:**
```typescript
interface UploadJob {
  id: string;
  project_key: string;
  file_name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  error_message?: string;
}
```

### Authentication Setup
Currently uses a demo token. For production:

1. **Update API client** in `/src/lib/api.ts`
2. **Add environment variables** for token management
3. **Implement token refresh** logic if needed

## Component Architecture

### Component Hierarchy

```
App (Router + Providers)
├── QueryClientProvider
├── TooltipProvider
├── Toast Providers (dual)
└── BrowserRouter
    ├── Index (Dashboard)
    │   ├── Navbar
    │   ├── StatsCard[]
    │   ├── ProjectCard[]
    │   ├── ProjectManagementModal
    │   ├── UploadModal
    │   └── DeleteProjectDialog
    ├── ProjectList (Table View)
    │   ├── Navbar
    │   ├── Table Components
    │   └── Action Modals
    └── NotFound
```

### Key Components

#### Core Components

1. **Navbar** (`/src/components/Navbar.tsx`)
   - Application header with branding
   - New project button
   - Notification bell (placeholder)
   - User avatar (placeholder)

2. **ProjectCard** (`/src/components/ProjectCard.tsx`)
   - Project information display
   - Status badge
   - Action buttons (upload, manage, delete)
   - Database configuration display

3. **StatsCard** (`/src/components/StatsCard.tsx`)
   - Statistics display with icons
   - Configurable title, value, and description

#### Modal Components

1. **ProjectManagementModal** - Create/edit projects
2. **UploadModal** - File upload with progress
3. **DeleteProjectDialog** - Confirmation dialog

#### Upload Components

1. **UploadProgress** (`/src/components/upload/UploadProgress.tsx`)
   - Multi-stage progress visualization
   - Time estimation
   - Status indicators

2. **UploadQueue** (`/src/components/upload/UploadQueue.tsx`)
   - Queue management interface
   - File list with status

### UI Component Library

The project uses **shadcn/ui** with 35+ components:

**Form Components**: Input, Select, Button, Checkbox, RadioGroup, Switch, Slider, etc.
**Layout Components**: Card, Dialog, Sheet, Tabs, Accordion, Collapsible, etc.
**Feedback Components**: Alert, Toast, Progress, Skeleton, Badge, etc.
**Navigation Components**: Breadcrumb, Menu, Pagination, Command, etc.
**Data Display**: Table, Avatar, Calendar, Chart, etc.

## State Management

### React Query Configuration

```typescript
// Global QueryClient setup
const queryClient = new QueryClient();

// Wraps entire application
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Custom Hooks for State Management

#### Project Management (`/src/hooks/useProjects.ts`)

```typescript
// Fetch all projects
const { data: projects, isLoading, error } = useProjects();

// Fetch single project
const { data: project } = useProject(projectKey);

// Create project mutation
const createProject = useCreateProject();
await createProject.mutateAsync(projectData);

// Update project mutation
const updateProject = useUpdateProject();
await updateProject.mutateAsync({ key, data });

// Delete project mutation
const deleteProject = useDeleteProject();
await deleteProject.mutateAsync(projectKey);
```

#### Upload Management (`/src/hooks/useUpload.ts`)

```typescript
// Monitor uploads (5s polling)
const { data: uploads } = useUploads();

// Upload file mutation
const uploadFile = useUploadFile();
await uploadFile.mutateAsync({ projectKey, file });
```

#### Processing Status (`/src/hooks/useProcessingStatus.ts`)

```typescript
// Real-time status (adaptive polling)
const { data: status } = useProcessingStatus(projectKey);

// Processing history
const { data: history } = useProcessingHistory(projectKey);
```

### Cache Management

**Invalidation Strategy:**
- **Create operations**: Invalidate list queries
- **Update operations**: Invalidate both list and item queries
- **Delete operations**: Invalidate list queries
- **Upload operations**: Invalidate upload queries

**Cache Configuration:**
- **Projects**: 5-minute stale time
- **Uploads**: Constant polling (always fresh)
- **Processing**: Adaptive polling (2s active, 10s idle)

## Routing

### Route Structure

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />           {/* Dashboard */}
    <Route path="/projects" element={<ProjectList />} /> {/* Project Table */}
    <Route path="*" element={<NotFound />} />        {/* 404 */}
  </Routes>
</BrowserRouter>
```

### Navigation Patterns

- **Primary navigation**: Navbar with brand and actions
- **Programmatic navigation**: `useNavigate()` hook
- **Route parameters**: Currently not used, but can be extended

### Adding New Routes

1. **Create page component** in `/src/pages/`
2. **Add route** to `App.tsx`
3. **Update navigation** in `Navbar.tsx` if needed

## API Integration

### API Client Architecture

**Centralized API Client** (`/src/lib/api.ts`):

```typescript
class ApiClient {
  private baseURL = 'http://localhost:8000';
  private token = 'demo_token';

  private async request(endpoint: string, options: RequestInit = {}) {
    // Centralized request handling
    // Error handling
    // Authentication
  }

  // Method implementations
  async getProjects(): Promise<Project[]>
  async createProject(data: CreateProjectData): Promise<Project>
  // ... other methods
}
```

### Error Handling Strategy

1. **API Level**: Catch network errors, log to console
2. **Hook Level**: Transform errors, trigger notifications
3. **Component Level**: Display error states, fallback UI

### Authentication Flow

Current implementation uses a demo token:
```typescript
headers: {
  'Authorization': `Bearer ${this.token}`,
  'Content-Type': 'application/json'
}
```

## Real-time Features

### Polling Strategy

1. **Upload Status**: 5-second intervals
```typescript
useQuery({
  queryKey: ['uploads'],
  queryFn: () => apiClient.getUploads(),
  refetchInterval: 5000
});
```

2. **Processing Status**: Adaptive polling
```typescript
useQuery({
  queryKey: ['processing-status', projectKey],
  queryFn: () => apiClient.getProcessingStatus(projectKey),
  refetchInterval: (data) => {
    const hasActiveJobs = data?.some(job => job.status === 'processing');
    return hasActiveJobs ? 2000 : 10000; // 2s or 10s
  }
});
```

### Progress Tracking

**Multi-stage upload process**:
1. Validation (0-20%)
2. Upload (20-40%)
3. Extracting (40-60%)
4. Building (60-80%)
5. Generating (80-100%)

## Database Health Monitoring

### Overview

The application includes a sophisticated database health monitoring system that tracks the connectivity status of Neo4j databases for each project. This system provides real-time feedback on database connectivity with intelligent polling strategies to optimize performance.

### Health Status Types

The system tracks four distinct database health states:

1. **`active`** - Database is reachable and credentials are valid
2. **`inactive`** - Database is unreachable (network/server issues)
3. **`invalid_credentials`** - Authentication failed (wrong username/password)
4. **`unknown`** - Initial state or connection test failed

### Smart Polling Strategy

#### Intelligent Polling Logic

The system implements smart polling that adapts based on database status:

```typescript
// Smart polling in useProjectDatabaseHealth
refetchInterval: (query) => {
  // Stop polling if credentials are invalid - they won't change until user edits them
  if (query.state.data?.status === 'invalid_credentials') {
    return false; // No more polling
  }
  // Continue polling for other statuses (active, inactive, unknown)
  return 5000; // 5 seconds for active/inactive states
}
```

#### Polling Behavior by Status

| Status | Polling Interval | Rationale |
|--------|------------------|-----------|
| `active` | 5 seconds | Monitor for connectivity issues |
| `inactive` | 5 seconds | Check for database recovery |
| `unknown` | 5 seconds | Determine actual status |
| `invalid_credentials` | **STOPPED** | Won't change until user edits credentials |

### Architecture

#### Core Hooks (`/src/hooks/useDatabaseHealth.ts`)

**1. `useDatabaseHealth()`** - General health monitoring
```typescript
const { data: allHealth } = useDatabaseHealth();
```

**2. `useDatabaseHealthSummary()`** - Dashboard statistics
```typescript
const { data: summary } = useDatabaseHealthSummary();
// Returns: { total_databases, active_databases, inactive_databases, invalid_credentials, unknown_databases }
```

**3. `useProjectDatabaseHealth(projectKey)`** - Individual project monitoring
```typescript
const { data: dbHealth } = useProjectDatabaseHealth(project.key);
// Returns: { project_key, status, response_time_ms, error_message, last_checked }
```

**4. `useRefreshDatabaseHealth()`** - Manual refresh controls
```typescript
const { refreshProjectHealth, refreshAllHealth } = useRefreshDatabaseHealth();

// Refresh specific project (triggers when credentials updated)
refreshProjectHealth(projectKey);

// Refresh all health data
refreshAllHealth();
```

### Backend API Integration

#### Individual Project Health
```
GET /api/v1/database/health/{project_key}
```

**Response Example:**
```json
{
  "project_key": "1331d407-6c00-4c19-9081-26de69cc3726",
  "project_name": "restaurant_project",
  "database_uri": "neo4j+ssc://a723a5fb.databases.neo4j.io",
  "status": "active",
  "response_time_ms": 612.14,
  "error_message": null,
  "last_checked": "2025-06-29T23:47:24.391021"
}
```

#### Health Summary
```
GET /api/v1/database/health/summary
```

**Response Example:**
```json
{
  "total_databases": 2,
  "active_databases": 1,
  "inactive_databases": 0,
  "invalid_credentials": 1,
  "unknown_databases": 0
}
```

### UI Components Integration

#### Project Cards (`ProjectCard.tsx`)

**Status Badge Display:**
```typescript
{dbHealth ? (
  <StatusBadge 
    status={
      dbHealth.status === 'active' 
        ? 'active' 
        : dbHealth.status === 'inactive' 
        ? 'inactive' 
        : dbHealth.status === 'invalid_credentials'
        ? 'error'
        : 'error'
    } 
  />
) : (
  <StatusBadge status="loading" />
)}
```

**Database Status Indicators:**
```typescript
// Pulsing green dot for active databases
{dbHealth.status === 'active' && <span className="animate-pulse">●</span>}

// Static red circle for inactive
{dbHealth.status === 'inactive' && '○'}

// Exclamation for invalid credentials  
{dbHealth.status === 'invalid_credentials' && '!'}
```

#### Dashboard Statistics

The dashboard displays real-time counts:
- **Total Databases**: All configured projects
- **Active Databases**: Successfully connected
- **Invalid Credentials**: Authentication failures
- **Inactive Databases**: Connection failures

### Performance Optimizations

#### 1. Smart Polling Prevention
- **Invalid credentials** stop polling immediately
- Saves unnecessary API calls for permanently failed states
- Resumes polling only when user edits project credentials

#### 2. React Query Configuration
```typescript
// Aggressive cache invalidation for real-time updates
staleTime: 1000,        // 1 second stale time
refetchInterval: 5000,  // 5 second polling
```

#### 3. Retry Strategy with Exponential Backoff
```typescript
retry: (failureCount, error: any) => {
  // Don't retry on server errors (500+)
  if (error?.response?.status >= 500) return false;
  return failureCount < 2;
},
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
```

**Retry Delays:**
- Retry 1: 1 second
- Retry 2: 2 seconds  
- Retry 3: 4 seconds
- Retry 4: 8 seconds
- Retry 5: 16 seconds
- Retry 6+: **30 seconds (maximum)**

### Integration with Project Management

#### Automatic Health Refresh on Project Updates

When a user updates project credentials, the system automatically refreshes health checks:

```typescript
// In useUpdateProject hook
const { refreshProjectHealth } = useRefreshDatabaseHealth();

onSuccess: (_, { key, data }) => {
  // Standard cache invalidation
  queryClient.invalidateQueries({ queryKey: ['projects'] });
  queryClient.invalidateQueries({ queryKey: ['project', key] });
  
  // If database config was updated, refresh health check to restart polling
  if (data.db_config) {
    refreshProjectHealth(key);
  }
  
  toast.success('Project updated successfully');
}
```

### Error Handling and User Feedback

#### Status Badge Colors and Labels
- **Active**: Green badge, "Active" text
- **Inactive**: Red badge, "Inactive" text  
- **Invalid Credentials**: Orange badge, "Error" text
- **Loading/Unknown**: Gray badge, "Checking..." text

#### Visual Indicators
- **Active databases**: Green pulsing dot (●) with animation
- **Inactive databases**: Red circle (○)
- **Invalid credentials**: Orange exclamation mark (!)
- **Unknown state**: Question mark (?)

### Troubleshooting Health Monitoring

#### Common Issues

**1. Health checks not updating**
- Check backend API endpoints are accessible
- Verify React Query DevTools for cache status
- Ensure project keys are correct

**2. Invalid credentials not detected properly**
- Verify backend returns correct status codes
- Check authentication error handling in API client
- Confirm Neo4j connection string format

**3. Polling not stopping for invalid credentials**
- Check `refetchInterval` function logic
- Verify `query.state.data?.status` is accessible
- Review React Query version compatibility

#### Development Testing

**Test different database states:**
```typescript
// Test with valid credentials
const validProject = {
  db_config: {
    uri: "neo4j+ssc://valid-host.databases.neo4j.io",
    user: "neo4j",
    password: "correct_password",
    database: "neo4j"
  }
};

// Test with invalid credentials
const invalidProject = {
  db_config: {
    uri: "neo4j+ssc://valid-host.databases.neo4j.io", 
    user: "neo4j",
    password: "wrong_password",
    database: "neo4j"
  }
};

// Test with unreachable database
const unreachableProject = {
  db_config: {
    uri: "neo4j+ssc://nonexistent.databases.neo4j.io",
    user: "neo4j", 
    password: "any_password",
    database: "neo4j"
  }
};
```

### Future Enhancements

#### Planned Improvements
1. **WebSocket integration** for real-time status updates
2. **Health history tracking** with charts
3. **Configurable polling intervals** per project
4. **Email/Slack notifications** for status changes
5. **Bulk health check operations**

#### Performance Considerations
- **Connection pooling** on backend for health checks
- **Rate limiting** to prevent API overload
- **Circuit breaker pattern** for failing databases
- **Caching strategy** for frequently checked projects

This sophisticated health monitoring system provides real-time visibility into database connectivity while optimizing performance through intelligent polling strategies.

### Progress Tracking System

The application includes a comprehensive progress tracking system for VXML file processing that provides real-time feedback on processing status with visual progress indicators.

#### Core Hook (`/src/hooks/useProjectProgress.ts`)

**`useProjectProgress(projectKey)`** - Project-level progress monitoring
```typescript
const { data: progress } = useProjectProgress(project.key);
// Returns: { project_key, total_files, processed_files, failed_files, pending_files, processing_files, progress_percentage }
```

#### Backend Integration

**File Progress Endpoint:**
```
GET /uploads/progress/{project_key}
```

**Response Example:**
```json
{
  "project_key": "1331d407-6c00-4c19-9081-26de69cc3726",
  "total_files": 10,
  "processed_files": 7,
  "failed_files": 1,
  "pending_files": 1,
  "processing_files": 1,
  "progress_percentage": 70.0
}
```

#### Visual Components (`/src/components/ui/progress-bar.tsx`)

**ProgressBar Component:**
```typescript
<ProgressBar 
  percentage={progress.progress_percentage}
  isProcessing={progress.processing_files > 0 || progress.pending_files > 0}
/>
```

**Features:**
- **Pulsing animation** during active processing
- **Color-coded status**: Blue (processing), Green (complete)
- **Percentage display** with status text
- **Responsive design** with smooth transitions

#### Integration with Project Cards

Progress bars automatically appear on project cards when files are present:

```typescript
{progress && progress.total_files > 0 && (
  <div className="py-2">
    <ProgressBar 
      percentage={progress.progress_percentage}
      isProcessing={progress.processing_files > 0 || progress.pending_files > 0}
    />
  </div>
)}
```

#### Polling Configuration

**Smart Progress Polling:**
- **5-second intervals** for real-time updates
- **Automatic polling** for all projects
- **Optimized caching** with React Query

```typescript
// In useProjectProgress hook
return useQuery({
  queryKey: ['project-progress', projectKey],
  queryFn: () => apiClient.getFileProgress(projectKey),
  refetchInterval: 5000, // Refresh every 5 seconds
  enabled: !!projectKey,
});
```

#### Retry Strategy

**Exponential Backoff:**
```typescript
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
```

**30-second Maximum Retry Delay:**
- Prevents excessive API calls during extended failures
- Balances responsiveness with resource efficiency
- Allows recovery from temporary network issues

## Error Handling

### Error Boundaries
Currently not implemented but recommended for production.

### Network Error Handling
```typescript
try {
  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error(`API request failed for ${endpoint}:`, error);
  throw error;
}
```

### User Feedback
- **Toast notifications** for success/error messages
- **Loading states** with skeleton components
- **Error states** with retry options
- **Empty states** for no data scenarios

## Styling & UI

### Tailwind CSS Configuration

**Design System Integration**:
```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS variables for theming
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... full color palette
      }
    }
  }
}
```

### Component Styling Patterns

1. **Utility-first approach** with Tailwind
2. **CSS variables** for theming
3. **Class variance authority** for component variants
4. **Responsive design** with mobile-first approach

### Dark Mode Support
Configured but not actively used. Can be enabled with `next-themes`.

## Development Workflow

### Code Organization Principles

1. **Feature-based organization** for specialized components
2. **Atomic design** with ui/ components
3. **Custom hooks** for business logic
4. **TypeScript interfaces** for type safety

### Best Practices

1. **Component composition** over inheritance
2. **Custom hooks** for stateful logic
3. **Error boundaries** for error handling
4. **Accessibility** with Radix UI primitives
5. **Performance** with React Query caching

### Code Quality Tools

- **ESLint**: Code linting with React rules
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (recommended)

## Deployment

### Build Process

```bash
# Production build
npm run build

# Development build (for debugging)
npm run build:dev

# Preview build locally
npm run preview
```

### Build Outputs
- **Static files** in `/dist` directory
- **Optimized bundles** with Vite
- **Type checking** during build

### Deployment Options

1. **Static hosting** (Netlify, Vercel, etc.)
2. **CDN deployment**
3. **Docker containerization**
4. **Traditional web servers**

### Environment Configuration

For production deployment:
1. **Update API base URL** in `/src/lib/api.ts`
2. **Configure authentication** tokens
3. **Set up environment variables**
4. **Configure CORS** on backend

## Troubleshooting

### Common Issues

#### Backend Connection Issues
**Symptoms**: Network errors, failed API calls
**Solutions**:
1. Verify backend is running on port 8000
2. Check CORS configuration
3. Verify API endpoint URLs
4. Check authentication token

#### Build Issues
**Symptoms**: TypeScript errors, build failures
**Solutions**:
1. Run `npm run lint` to check for errors
2. Verify all imports are correct
3. Check TypeScript configuration
4. Clear node_modules and reinstall

#### Development Server Issues
**Symptoms**: Hot reload not working, port conflicts
**Solutions**:
1. Check if port 5173 is available
2. Restart development server
3. Clear browser cache
4. Check Vite configuration

### Performance Issues
**Symptoms**: Slow loading, high memory usage
**Solutions**:
1. Check React Query cache size
2. Optimize component re-renders
3. Use React DevTools Profiler
4. Implement code splitting if needed

### Browser Compatibility
- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **ES2020 features** used
- **Polyfills** may be needed for older browsers

## Additional Resources

### Documentation Links
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/)

### Component Library
- [Radix UI](https://radix-ui.com/) - Primitive components
- [Lucide Icons](https://lucide.dev/) - Icon library

### Development Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TanStack Query DevTools](https://tanstack.com/query/v4/docs/devtools)

---

This comprehensive guide provides everything a new developer needs to understand and work with the ExampleFrontend application. The architecture is designed to be scalable, maintainable, and developer-friendly while providing a robust foundation for VXML processing and project management.