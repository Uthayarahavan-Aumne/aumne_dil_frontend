
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Upload, Settings, Database, Calendar, Trash2 } from 'lucide-react';
import { Project } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useProjectProgress } from '@/hooks/useProjectProgress';
import { useProjectDatabaseHealth } from '@/hooks/useDatabaseHealth';

interface ProjectCardProps {
  project: Project;
  onUpload: () => void;
  onManage: () => void;
  onDelete?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onUpload, 
  onManage, 
  onDelete 
}) => {
  const { data: progress, error: progressError, isError } = useProjectProgress(project.key);
  const { data: dbHealth } = useProjectDatabaseHealth(project.key);

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.name}
          </CardTitle>
          {dbHealth ? (
            <StatusBadge 
              status={
                dbHealth.status === 'active' 
                  ? 'active' 
                  : dbHealth.status === 'checking'
                  ? 'checking'
                  : 'error'
              } 
            />
          ) : (
            <StatusBadge status="loading" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database className="h-4 w-4" />
            <span className="truncate">{project.db_config.database}</span>
            {dbHealth && (
              <span className={`px-1 py-0.5 text-xs rounded-full font-medium ${
                dbHealth.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : dbHealth.status === 'checking'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`${
                  dbHealth.status === 'active' || dbHealth.status === 'checking' ? 'animate-pulse' : ''
                }`}>
                  {dbHealth.status === 'active' && '●'}
                  {dbHealth.status === 'checking' && '◐'}
                  {dbHealth.status === 'error' && '○'}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
        </div>

        {progress && progress.total_files > 0 && !isError && (
          <div className="py-2">
            <ProgressBar 
              percentage={progress.progress_percentage}
              isProcessing={progress.processing_files > 0 || progress.pending_files > 0}
              failedFiles={progress.failed_files}
              totalFiles={progress.total_files}
            />
          </div>
        )}

        {progress && progress.total_files === 0 && !isError && (
          <div className="py-2">
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              Upload files to see progress
            </div>
          </div>
        )}

        {isError && (
          <div className="py-2">
            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Unable to load progress data
            </div>
          </div>
        )}

        <div className="pt-2 space-y-2">
          <Button 
            onClick={onUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={onManage}
              variant="outline" 
              className="flex-1"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
            
            {onDelete && (
              <Button 
                onClick={onDelete}
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
