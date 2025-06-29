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
12. [Error Handling](#error-handling)
13. [Styling & UI](#styling--ui)
14. [Development Workflow](#development-workflow)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)

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