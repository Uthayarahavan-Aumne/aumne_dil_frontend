import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Navbar } from '@/components/Navbar';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjects } from '@/hooks/useProjects';
import { useUploadStatus } from '@/hooks/useUploadStatus';
import { UploadJob } from '@/lib/api';
import { 
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  ArrowRight,
  ArrowLeft,
  Folder,
  Download,
  RefreshCw,
  Activity,
  Timer,
  AlertTriangle
} from 'lucide-react';

// Using UploadJob interface from API

const ProjectDataProcessing = () => {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: uploadStatus, isLoading: uploadStatusLoading, error: uploadStatusError } = useUploadStatus({
    projectKey: projectKey!
  });
  
  const project = projects?.find(p => p.key === projectKey);
  
  // Filter files for this project
  const projectFiles = uploadStatus?.filter(file => 
    file.project_key === projectKey
  ) || [];

  const handleRetry = (fileId: string) => {
    // TODO: Implement retry logic
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">
          <Activity className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      case 'queued':
        return <Badge variant="outline">
          <Timer className="h-3 w-3 mr-1" />
          Queued
        </Badge>;
      default:
        return <Badge variant="outline">
          <Timer className="h-3 w-3 mr-1" />
          Unknown
        </Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProcessingStats = () => {
    const total = projectFiles.length;
    const completed = projectFiles.filter(f => f.status === 'completed').length;
    const processing = projectFiles.filter(f => f.status === 'processing').length;
    const failed = projectFiles.filter(f => f.status === 'failed').length;
    const pending = projectFiles.filter(f => f.status === 'queued').length;
    
    return { total, completed, processing, failed, pending };
  };

  const stats = getProcessingStats();
  const hasSuccessfulProcessing = stats.completed > 0;
  const hasFailures = stats.failed > 0;
  const isProcessing = stats.processing > 0;

  // Handle errors first
  if (projectsError || uploadStatusError) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex-1">
          <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to connect to backend
              </h3>
              <p className="text-gray-500">
                Check if the server is running on port 8000
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {projectsError?.message || uploadStatusError?.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projectsLoading || uploadStatusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex-1">
          <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-80 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex-1">
          <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Project not found
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projectFiles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex-1">
          <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No files to process
              </h3>
              <p className="text-gray-500 mb-6">
                Upload files first to see processing status
              </p>
              <Button
                onClick={() => navigate(`/projects/${projectKey}/data-input`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Data Input
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
      <div className="flex-1">
        <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {project.name} - Data Processing
                </h1>
                <p className="text-gray-600">
                  Monitor the processing status of your uploaded files
                </p>
              </div>
            </div>
          </div>

          {/* Processing Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Processing Overview
              </CardTitle>
              <CardDescription>
                Real-time status of file processing pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-500">Total Files</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                  <div className="text-sm text-gray-500">Processing</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
              </div>
              
              {isProcessing && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Activity className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Files are currently being processed. This page will update automatically.
                  </AlertDescription>
                </Alert>
              )}
              
              {hasFailures && (
                <Alert className="border-red-200 bg-red-50 mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Some files failed to process. Check individual file status below and use retry button.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* File Processing Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                File Processing Details
              </CardTitle>
              <CardDescription>
                Detailed status for each uploaded file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-6 bg-white rounded-lg border-2 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <FileText className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {file.file_name}
                          </h3>
                          {getStatusBadge(file.status)}
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Project: {file.project_key}</span>
                          <span>Uploaded: {formatDate(file.created_at)}</span>
                        </div>
                        
                        {file.status === 'processing' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Processing in progress...</span>
                              <span className="text-sm text-gray-600">Working</span>
                            </div>
                            <Progress value={50} className="h-2" />
                          </div>
                        )}
                        
                        {file.status === 'failed' && file.error_message && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">
                              <strong>Error:</strong> {file.error_message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      {file.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(file.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      {file.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {file.status === 'queued' && (
                        <div className="text-sm text-gray-500">
                          Waiting to process
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={() => navigate(`/projects/${projectKey}/data-input`)}
              variant="outline"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Data Input
            </Button>
            
            <Button
              onClick={() => navigate(`/projects/${projectKey}/kb-configuration`)}
              disabled={!hasSuccessfulProcessing}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              Next: KB Configuration
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProjectManagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default ProjectDataProcessing;