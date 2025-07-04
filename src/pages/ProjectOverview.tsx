import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Navbar } from '@/components/Navbar';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { useProjectProgress } from '@/hooks/useProjectProgress';
import { useProjectDatabaseHealth } from '@/hooks/useDatabaseHealth';
import { 
  FolderOpen, 
  Upload, 
  Database, 
  Activity,
  FileText,
  Edit
} from 'lucide-react';

const ProjectOverview = () => {
  const { projectKey } = useParams<{ projectKey: string }>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: projectProgress } = useProjectProgress(projectKey || '');
  const { data: dbHealth } = useProjectDatabaseHealth(projectKey || '');
  
  const project = projects?.find(p => p.key === projectKey);

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex-1">
          <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-80 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24" />
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
              <p className="text-gray-500">
                The project you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Files',
      value: projectProgress?.totalFiles || 0,
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Processed Files',
      value: projectProgress?.processedFiles || 0,
      icon: Upload,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Database Status',
      value: dbHealth?.status === 'active' ? 'Active' : 'Error',
      icon: Database,
      iconColor: dbHealth?.status === 'active' ? 'text-green-600' : 'text-red-600',
      bgColor: dbHealth?.status === 'active' ? 'bg-green-100' : 'bg-red-100'
    },
    {
      title: 'Processing Jobs',
      value: projectProgress?.processingFiles || 0,
      icon: Activity,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

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
                  {project.name}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {project.key}
                  </span>
                  • Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Configuration
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{project.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Neo4j Database</label>
                  <p className="text-gray-900 font-mono">{project.db_config.database}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Host</label>
                  <p className="text-gray-900 font-mono">{project.db_config.host}:{project.db_config.port}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Files
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProjectManagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <ProjectManagementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        mode="edit"
      />
    </div>
  );
};

export default ProjectOverview;