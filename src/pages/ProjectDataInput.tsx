import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Navbar } from '@/components/Navbar';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { UploadModal } from '@/components/UploadModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { useUploadStatus } from '@/hooks/useUploadStatus';
import { UploadJob } from '@/lib/api';
import { 
  Upload, 
  FileText,
  AlertCircle,
  ArrowRight,
  Folder,
  RefreshCw
} from 'lucide-react';

// Using UploadJob interface from API

const ProjectDataInput = () => {
  try {
    const { projectKey } = useParams<{ projectKey: string }>();
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
    const { data: uploadStatus, isLoading: uploadStatusLoading, error: uploadStatusError } = useUploadStatus({
      projectKey: projectKey!
    });
    
  
  const project = projects?.find(p => p.key === projectKey);
  
  // Filter files for this project
  const projectFiles = uploadStatus?.filter(file => 
    file.project_key === projectKey
  ) || [];

  // Remove unused handleRetry function

  const handleReupload = () => {
    setIsUploadModalOpen(true);
  };

  // Remove status badge function as we're not showing processing status

  // Remove unused formatFileSize function

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const hasAnyUpload = projectFiles.length > 0;

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
              <Skeleton className="h-64" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20" />
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
                  {project.name} - Data Input
                </h1>
                <p className="text-gray-600 mb-2">
                  Upload your VXML files to extract voice flow information
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Created by: {project.userid || 'Unknown'}</p>
                  <p>Last updated: {project.updated_at ? formatDate(project.updated_at) : 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Upload VXML Files
              </CardTitle>
              <CardDescription className="text-lg">
                Upload your existing voice flow files to start the analysis process
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg p-12 mb-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload ZIP Files
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Select and upload ZIP files containing your VXML voice flow files
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                        size="lg"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload ZIP Files
                      </Button>
                      {hasAnyUpload && (
                        <Button
                          onClick={handleReupload}
                          variant="outline"
                          className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                          size="lg"
                        >
                          <RefreshCw className="h-5 w-5 mr-2" />
                          Reupload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Only .zip files are supported</p>
                <p>• One file upload at a time</p>
                <p>• Files will be processed automatically after upload</p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files Section - Always show */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Uploaded ZIP Files
              </CardTitle>
              <CardDescription>
                All ZIP files uploaded to this project and their processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectFiles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No ZIP files uploaded yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Upload your first ZIP file containing VXML files to get started
                  </p>
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload ZIP File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-6 bg-white rounded-lg border-2 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {file.file_name}
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Project:</span> {file.project_key}
                            </div>
                            <div>
                              <span className="font-medium">Uploaded:</span> {formatDate(file.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        <div className="text-sm text-gray-500">
                          File uploaded
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={() => navigate(`/projects/${projectKey}/data-processing`)}
              disabled={!hasAnyUpload}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              Next: Data Processing
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            {hasAnyUpload && (
              <Button
                onClick={handleReupload}
                variant="outline"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                size="lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Reupload & Replace
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProjectManagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        projectKey={projectKey}
      />
    </div>
  );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Component Error
          </h3>
          <p className="text-gray-500 mb-4">
            There was an error rendering the Data Input page.
          </p>
          <p className="text-xs text-gray-400">
            Check the browser console for more details.
          </p>
        </div>
      </div>
    );
  }
};

export default ProjectDataInput;