
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Upload, Settings, Database, Calendar, Trash2 } from 'lucide-react';
import { Project } from '@/lib/api';
import { formatDate } from '@/lib/utils';

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

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.name}
          </CardTitle>
          <StatusBadge status="active" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database className="h-4 w-4" />
            <span className="truncate">{project.db_config.database}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
        </div>

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
