import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Navbar } from '@/components/Navbar';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { UploadModal } from '@/components/UploadModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { useUploadStatus } from '@/hooks/useUploadStatus';
import { 
  FolderOpen, 
  Upload, 
  FileText,
  Search,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface FileItemProps {
  file: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    source: string;
    upload_date: string;
    processing_status: string;
    processing_progress: number;
    user_id: string;
    error_message?: string;
  };
  onRetry: (fileId: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onRetry }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Processed
        </Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      case 'unsupported':
        return <Badge variant="secondary">
          <X className="h-3 w-3 mr-1" />
          Unsupported
        </Badge>;
      default:
        return <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Pending
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

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{file.file_name}</div>
            <div className="text-sm text-gray-500">{file.file_type}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {formatFileSize(file.file_size)}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {file.source}
      </TableCell>
      <TableCell>
        {getStatusBadge(file.processing_status)}
      </TableCell>
      <TableCell>
        {file.processing_status === 'processing' ? (
          <div className="space-y-1">
            <Progress value={file.processing_progress} className="w-full" />
            <span className="text-xs text-gray-500">{file.processing_progress}%</span>
          </div>
        ) : file.processing_status === 'failed' ? (
          <div className="space-y-1">
            <div className="text-sm text-red-600">{file.error_message || 'Processing failed'}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(file.id)}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : file.processing_status === 'completed' ? (
          <div className="text-sm text-green-600">Successfully processed</div>
        ) : file.processing_status === 'unsupported' ? (
          <div className="text-sm text-gray-500">File type not supported</div>
        ) : (
          <div className="text-sm text-gray-500">Waiting to be processed</div>
        )}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {formatDate(file.upload_date)}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {file.user_id}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const ProjectFiles = () => {
  const { projectKey } = useParams<{ projectKey: string }>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: uploadStatus, isLoading: uploadStatusLoading } = useUploadStatus({
    projectKey: projectKey!
  });
  
  const project = projects?.find(p => p.key === projectKey);
  
  // Filter files for this project
  const projectFiles = uploadStatus?.filter(file => 
    file.project_key === projectKey &&
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRetry = (fileId: string) => {
    // TODO: Implement retry logic
  };

  if (projectsLoading || uploadStatusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex-1">
          <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-80 mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
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
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Project not found
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasSuccessfulUpload = projectFiles.some(file => file.processing_status === 'completed');

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
                  {project.name} - Files
                </h1>
                <p className="text-gray-600">
                  Upload and manage VXML files for processing
                </p>
              </div>
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>

          {/* Search and Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Files
                </Button>
              </div>
            </div>
          </div>

          {/* Files Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No files found' : 'No files uploaded yet'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm 
                          ? 'Try adjusting your search terms'
                          : 'Upload .zip or .vxml files to get started'
                        }
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => setIsUploadModalOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  projectFiles.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onRetry={handleRetry}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Next Button */}
          {projectFiles.length > 0 && (
            <div className="mt-8 flex justify-end">
              <Button
                disabled={!hasSuccessfulUpload}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Next: Data Processing
              </Button>
            </div>
          )}
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
};

export default ProjectFiles;