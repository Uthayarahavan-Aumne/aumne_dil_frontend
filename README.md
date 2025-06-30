# VXML Processing Frontend

A modern React application for VXML (Voice XML) file processing and project management with real-time monitoring capabilities.

## Quick Start

### Prerequisites
- Node.js 18+
- Backend server running on `http://localhost:8000`

### Installation
```bash
# Install dependencies
npm install

# Start development server  
npm run dev
```

Access the application at `http://localhost:8080`

## Features

- **Project Management**: Create, edit, and delete VXML processing projects
- **File Upload**: Drag & drop ZIP file uploads with real-time progress tracking
- **Status Monitoring**: Dedicated upload status page with automatic polling
- **Database Health**: Real-time Neo4j database connectivity monitoring
- **Responsive Design**: Mobile-first UI with modern components

## Technology Stack

- **React 18.3.1** with TypeScript
- **Vite** - Fast build tool and development server
- **shadcn/ui** - Modern component library built on Radix UI
- **Tailwind CSS** - Utility-first styling
- **TanStack React Query** - Server state management with caching
- **React Router DOM** - Client-side routing

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components (35+ components)
│   ├── upload/             # Upload-specific components
│   ├── processing/         # Processing status components
│   └── [other components]  # Project cards, modals, etc.
├── hooks/                  # Custom React hooks for API integration
├── lib/
│   ├── api.ts             # API client with TypeScript interfaces
│   ├── config.ts          # Polling and configuration constants
│   └── utils.ts           # Utility functions
├── pages/
│   ├── Index.tsx          # Main dashboard
│   ├── UploadStatusPage.tsx # Upload status monitoring
│   └── ProjectList.tsx    # Project management
└── test/                  # Testing utilities and setup
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm test             # Run tests with Vitest
```

## API Integration

### Backend Requirements
The frontend expects a backend server with these endpoints:

**Project Management:**
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create project
- `PUT /api/v1/projects/{key}` - Update project
- `DELETE /api/v1/projects/{key}` - Delete project

**File Upload & Processing:**
- `POST /upload` - Upload VXML files
- `GET /uploads` - List upload jobs with status
- `GET /uploads/progress/{project_key}` - Get file processing progress

**Health Monitoring:**
- `GET /api/v1/database/health` - Database health check
- `GET /api/v1/database/health/summary` - Health summary
- `GET /health` - Service health check

### Authentication
Currently uses bearer token authentication with `demo_token` for development.

## Upload Status Monitoring

### Automatic Polling
The application includes intelligent polling for real-time status updates:

- **Default Interval**: 30 seconds for upload status page
- **Smart Polling**: 2 seconds when active jobs are processing
- **Visual Indicators**: "Fast polling active" badge during accelerated polling

### Configuration
Polling behavior is configured in `src/lib/config.ts`:

```typescript
export const POLLING_CONFIG = {
  ACTIVE_POLLING_INTERVAL: 2000,    // 2 seconds for active jobs
  DEFAULT_POLLING_INTERVAL: 30000,  // 30 seconds default
  REFRESH_DEBOUNCE_DELAY: 1000,     // 1 second debounce
};
```

### Manual Refresh
- Debounced refresh button prevents duplicate API calls
- Loading states with spinner and "Refreshing..." text
- Error recovery with retry buttons

## Database Health Monitoring

### Simplified Status System
- **Active**: Database is reachable and working correctly
- **Error**: Any problem including credentials, network, or database issues

### Smart Retry Strategy
- Automatic retry for connection errors (3 attempts with exponential backoff)
- One-time checks on component mount and after project edits
- No continuous polling to optimize performance

## Development

### Component Architecture
- **Component-based** with reusable UI components
- **Custom hooks** for business logic separation
- **API layer abstraction** with centralized error handling
- **Type-first development** with comprehensive TypeScript interfaces

### State Management
- **TanStack React Query** for server state with intelligent caching
- **React Hook Form** for form management with Zod validation
- **Local state** using React hooks

### Testing
Comprehensive testing setup with Vitest and React Testing Library:

```bash
# Run all tests
npm test

# Run specific test files
npm test -- useUploadStatus
npm test -- UploadStatusPage
```

## Deployment

### Build Process
```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

### Environment Configuration
For production deployment:
1. Update API base URL in `src/lib/api.ts`
2. Configure authentication tokens
3. Set up environment variables
4. Configure CORS on backend

## Troubleshooting

### Common Issues

**Backend Connection**
- Verify backend is running on port 8000
- Check CORS configuration
- Verify API endpoint URLs

**Polling Not Working**
- Ensure `enableAutoRefresh` is set to `true`
- Check browser network tab for API call errors
- Verify authentication token

**Build Issues**
- Run `npm run lint` to check for errors
- Clear node_modules and reinstall
- Check TypeScript configuration

## Further Reading

For detailed development information, component architecture, and advanced features, see the [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).

## License

This project is part of the VXML processing system for voice menu analysis.