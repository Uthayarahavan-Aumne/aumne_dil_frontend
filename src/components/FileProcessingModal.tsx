import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface FileProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectKey: string;
  projectName: string;
}

interface FileStatus {
  id: number;
  file_name: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

interface FileProcessingResponse {
  project_key: string;
  project_name: string;
  total_files: number;
  files: FileStatus[];
  status_summary: {
    pending: number;
    processing: number;
    processed: number;
    failed: number;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'processed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'processed':
      return <Badge variant="default" className="bg-green-100 text-green-700">Processed</Badge>;
    case 'processing':
      return <Badge variant="default" className="bg-blue-100 text-blue-700">Processing</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'pending':
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

export const FileProcessingModal: React.FC<FileProcessingModalProps> = ({
  isOpen,
  onClose,
  projectKey,
  projectName,
}) => {
  const {
    data: fileData,
    isLoading,
    error,
    refetch,
  } = useQuery<FileProcessingResponse>({
    queryKey: ['project-files', projectKey],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/projects/${projectKey}/files`);
      return response;
    },
    enabled: isOpen && !!projectKey,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = () => {
    refetch();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            File Processing Status - {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with stats and refresh button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Project: <span className="font-mono">{projectKey.substring(0, 8)}...</span>
              </div>
              {fileData && (
                <div className="text-sm text-gray-600">
                  Total Files: <span className="font-semibold">{fileData.total_files}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Status Summary */}
          {fileData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{fileData.status_summary.processed}</div>
                <div className="text-sm text-gray-500">Processed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{fileData.status_summary.processing}</div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{fileData.status_summary.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{fileData.status_summary.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load file processing status. Please try again.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={handleRefresh}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          )}

          {/* Files List */}
          {fileData && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Files ({fileData.files.length})</h4>
              
              {fileData.files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No files found for this project</p>
                  <p className="text-sm mt-2">Upload some VXML files to see them here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fileData.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{file.file_name}</div>
                          <div className="text-sm text-gray-500">
                            Created: {file.created_at ? formatDateTime(file.created_at) : 'Unknown'}
                            {file.updated_at && file.updated_at !== file.created_at && (
                              <span className="ml-4">
                                Updated: {formatDateTime(file.updated_at)}
                              </span>
                            )}
                          </div>
                          {file.error_message && (
                            <div className="text-sm text-red-600 mt-1">
                              Error: {file.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(file.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};