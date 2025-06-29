
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pause, Play, X, RefreshCw } from 'lucide-react';
import { UploadJob } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface UploadQueueItem extends UploadJob {
  progress?: number;
  isPaused?: boolean;
}

interface UploadQueueProps {
  uploads: UploadQueueItem[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
}

export const UploadQueue: React.FC<UploadQueueProps> = ({
  uploads,
  onPause,
  onResume,
  onCancel,
  onRetry,
}) => {
  if (uploads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No uploads in queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {uploads.map((upload) => (
        <Card key={upload.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.file_name}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {formatDateTime(upload.created_at)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <StatusBadge status={upload.status} />
                
                <div className="flex space-x-1">
                  {upload.status === 'processing' && !upload.isPaused && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPause?.(upload.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {upload.status === 'processing' && upload.isPaused && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResume?.(upload.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {upload.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry?.(upload.id)}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {(upload.status === 'queued' || upload.status === 'processing') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel?.(upload.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {(upload.status === 'processing' || upload.progress) && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(upload.progress || 0)}%</span>
                </div>
                <Progress value={upload.progress || 0} className="h-2" />
              </div>
            )}
            
            {upload.error_message && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-600">{upload.error_message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
