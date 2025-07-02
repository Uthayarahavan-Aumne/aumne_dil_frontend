import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Upload, Settings, Database, Calendar, Trash2, FileText } from 'lucide-react';
import { Project } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useProjectProgress } from '@/hooks/useProjectProgress';
import { useProjectDatabaseHealth } from '@/hooks/useDatabaseHealth';

interface ProjectListItemProps {
  project: Project;
  onUpload: () => void;
  onManage: () => void;
  onDelete?: () => void;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ 
  project, 
  onUpload, 
  onManage, 
  onDelete 
}) => {
  const { data: progress, error: progressError, isError } = useProjectProgress(project.key);
  const { data: dbHealth } = useProjectDatabaseHealth(project.key);

  return (
    <div className="bg-white border border-gray-200 rounded-md hover:shadow-sm transition-all duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-medium text-gray-900 truncate">
                {project.name}
              </h3>
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

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1.5">
                <Database className="h-3 w-3" />
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
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(project.created_at)}</span>
              </div>
              {progress && progress.total_files > 0 && (
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  <span>{progress.total_files} files</span>
                </div>
              )}
            </div>

            {/* Progress Section */}
            {progress && progress.total_files > 0 && !isError && (
              <div className="mb-2">
                <ProgressBar 
                  percentage={progress.progress_percentage}
                  isProcessing={progress.processing_files > 0}
                  failedFiles={progress.failed_files}
                  totalFiles={progress.total_files}
                  databaseStatus={dbHealth?.status}
                  pendingFiles={progress.pending_files}
                />
              </div>
            )}

            {progress && progress.total_files === 0 && !isError && (
              <div className="mb-2">
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                  Upload files to see progress
                </div>
              </div>
            )}

            {isError && (
              <div className="mb-2">
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-block">
                  Unable to load progress data
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 ml-3">
            <Button 
              onClick={onUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Upload className="h-3 w-3 mr-1.5" />
              Upload
            </Button>
            
            <Button 
              onClick={onManage}
              variant="outline" 
              size="sm"
            >
              <Settings className="h-3 w-3 mr-1.5" />
              Manage
            </Button>
            
            {onDelete && (
              <Button 
                onClick={onDelete}
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};