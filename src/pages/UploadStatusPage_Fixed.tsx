import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { useUploadStatus } from '@/hooks/useUploadStatus';
import { UploadJob } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { STATUS_PAGE_CONFIG } from '@/lib/config';

interface UploadStatusPageProps {
  projectKey?: string;
}

export const UploadStatusPage: React.FC<UploadStatusPageProps> = ({ projectKey }) => {
  const { 
    data: uploads, 
    isLoading, 
    error, 
    isRefreshing, 
    refetch, 
    canRefresh 
  } = useUploadStatus({
    projectKey,
    enableAutoRefresh: STATUS_PAGE_CONFIG.AUTO_REFRESH_ENABLED,
    pollingInterval: STATUS_PAGE_CONFIG.AUTO_REFRESH_INTERVAL,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredUploads = uploads?.filter(upload => {
    const matchesSearch = upload.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || upload.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpanded = (uploadId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uploadId)) {
        newSet.delete(uploadId);
      } else {
        newSet.add(uploadId);
      }
      return newSet;
    });
  };

  const getStatusStats = () => {
    if (!uploads) return {};
    
    return uploads.reduce((acc, upload) => {
      acc[upload.status] = (acc[upload.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const stats = getStatusStats();
  const hasActiveJobs = uploads?.some(job => job.status === 'queued' || job.status === 'processing');

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="text-lg">Loading upload status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload Status Monitor</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of VXML file processing
            {hasActiveJobs && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                Fast polling active
              </Badge>
            )}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load upload status: {error.message}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => refetch()}
              disabled={!canRefresh}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upload Status Dashboard</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={!canRefresh}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{uploads?.length || 0}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(stats.processing || 0) + (stats.queued || 0)}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload List */}
          {!filteredUploads || filteredUploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {uploads?.length === 0 ? 'No uploads found' : 'No uploads match your filters'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUploads.map((upload) => (
                <div key={upload.id} className="border rounded-lg">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpanded(upload.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedItems.has(upload.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium">{upload.file_name}</div>
                        <div className="text-sm text-gray-500">
                          Created: {formatDateTime(upload.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusBadge status={upload.status} />
                    </div>
                  </div>

                  {expandedItems.has(upload.id) && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="mt-3 space-y-2">
                        <div><strong>Project:</strong> {upload.project_key}</div>
                        <div><strong>Status:</strong> {upload.status}</div>
                        <div><strong>Created:</strong> {formatDateTime(upload.created_at)}</div>
                        {upload.error_message && (
                          <div><strong>Error:</strong> {upload.error_message}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadStatusPage;