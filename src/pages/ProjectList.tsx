
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog';
import { UploadModal } from '@/components/UploadModal';
import { FileProcessingModal } from '@/components/FileProcessingModal';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { useProjectDatabaseHealth, useRefreshDatabaseHealth } from '@/hooks/useDatabaseHealth';
import { Project } from '@/lib/api';
import { Search, Edit, Trash2, Upload, Plus, FolderOpen, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

// Individual project row component to handle database health
const ProjectTableRow = ({ 
  project, 
  onEdit, 
  onDelete, 
  onUpload,
  onViewFiles
}: { 
  project: Project; 
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onUpload: (project: Project) => void;
  onViewFiles: (project: Project) => void;
}) => {
  const { data: dbHealth } = useProjectDatabaseHealth(project.key);

  const getStatusForBadge = () => {
    if (!dbHealth) return 'loading';
    
    // Handle all status types
    switch (dbHealth.status) {
      case 'active':
        return 'active';
      case 'checking':
        return 'checking';
      case 'error':
      default:
        return 'error';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {project.name}
      </TableCell>
      <TableCell className="text-sm text-gray-600 font-mono">
        {project.key.substring(0, 8)}...
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {project.db_config.database}
      </TableCell>
      <TableCell>
        <StatusBadge status={getStatusForBadge()} />
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {formatDateTime(project.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewFiles(project)}
          >
            <FileText className="h-4 w-4 mr-1" />
            View Files
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpload(project)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(project)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects();
  const { triggerBatchHealthCheck } = useRefreshDatabaseHealth();
  
  // Trigger initial health check when projects are loaded
  React.useEffect(() => {
    if (projects && projects.length > 0) {
      triggerBatchHealthCheck();
    }
  }, [projects, triggerBatchHealthCheck]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [uploadProject, setUploadProject] = useState<Project | null>(null);
  const [viewFilesProject, setViewFilesProject] = useState<Project | null>(null);

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.key.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to load projects
            </h3>
            <p className="text-gray-500 mb-6">
              Check if the backend is running on port 8000
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project Management
          </h1>
          <p className="text-gray-600">
            Manage your VXML processing projects and configurations
          </p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Neo4j Database</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No projects found' : 'No projects yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : 'Get started by creating your first VXML processing project'
                      }
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <ProjectTableRow
                    key={project.key}
                    project={project}
                    onEdit={setEditProject}
                    onDelete={setDeleteProject}
                    onUpload={setUploadProject}
                    onViewFiles={setViewFilesProject}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Modals */}
      <ProjectManagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <ProjectManagementModal
        isOpen={!!editProject}
        onClose={() => setEditProject(null)}
        project={editProject || undefined}
        mode="edit"
      />

      <DeleteProjectDialog
        isOpen={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        project={deleteProject}
      />

      <UploadModal
        isOpen={!!uploadProject}
        onClose={() => setUploadProject(null)}
        projectKey={uploadProject?.key}
      />

      <FileProcessingModal
        isOpen={!!viewFilesProject}
        onClose={() => setViewFilesProject(null)}
        projectKey={viewFilesProject?.key || ''}
        projectName={viewFilesProject?.name || ''}
      />
    </div>
  );
};

export default ProjectList;
