
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, ChevronRight, Download, RefreshCw } from 'lucide-react';
import { useProcessingHistory } from '@/hooks/useProcessingStatus';
import { UploadJob } from '@/lib/api';
import { ProcessingTimeline } from './ProcessingTimeline';
import { formatDateTime } from '@/lib/utils';

interface ProcessingHistoryProps {
  projectKey?: string;
}

export const ProcessingHistory: React.FC<ProcessingHistoryProps> = ({ projectKey }) => {
  const { data: uploads, isLoading, refetch } = useProcessingHistory(projectKey);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Processing History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Stats */}
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
            <div className="text-2xl font-bold text-blue-600">{stats.processing || 0}</div>
            <div className="text-sm text-gray-500">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload List */}
        <div className="space-y-3">
          {filteredUploads?.map((upload) => {
            const isExpanded = expandedItems.has(upload.id);
            
            return (
              <Card key={upload.id} className="border-l-4 border-l-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(upload.id)}
                        className="p-0 h-6 w-6"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(upload.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={upload.status} />
                      
                      {upload.status === 'completed' && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ProcessingTimeline upload={upload} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {filteredUploads?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No uploads found matching your criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
