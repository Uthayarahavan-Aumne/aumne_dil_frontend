
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProjectCard } from '@/components/ProjectCard';
import { StatsCard } from '@/components/StatsCard';
import { UploadModal } from '@/components/UploadModal';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { useUploads } from '@/hooks/useUpload';
import { useAggregatedFileProgress } from '@/hooks/useFileProgress';
import { useDatabaseHealthSummary, useRefreshDatabaseHealth } from '@/hooks/useDatabaseHealth';
import { Project } from '@/lib/api';
import { 
  FolderOpen, 
  Upload, 
  Database, 
  Activity,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: uploads } = useUploads();
  const { data: aggregatedProgress } = useAggregatedFileProgress();
  const { data: databaseHealthSummary } = useDatabaseHealthSummary();
  const { triggerBatchHealthCheck } = useRefreshDatabaseHealth();
  
  // Trigger initial health check when projects are loaded
  React.useEffect(() => {
    if (projects && projects.length > 0) {
      triggerBatchHealthCheck();
    }
  }, [projects, triggerBatchHealthCheck]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manageProject, setManageProject] = useState<Project | null>(null);
  const [uploadProject, setUploadProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleUpload = (project: Project) => {
    setUploadProject(project);
  };

  const handleManage = (project: Project) => {
    console.log('Managing project:', project.key);
    setManageProject(project);
  };

  const handleDelete = (project: Project) => {
    setDeleteProject(project);
  };

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate stats
  const totalProjects = projects?.length || 0;
  const processedFiles = aggregatedProgress?.totalProcessedFiles || 0;
  const processingJobs = aggregatedProgress?.totalProcessingFiles || 0;
  const activeDatabases = databaseHealthSummary?.active_databases || 0;
  const errorDatabases = databaseHealthSummary?.error_databases || 0;

  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: FolderOpen,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Files Processed',
      value: processedFiles,
      icon: Upload,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Databases',
      value: activeDatabases,
      icon: Database,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Processing Jobs',
      value: processingJobs,
      icon: Activity,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (projectsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FolderOpen className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to connect to backend
            </h3>
            <p className="text-gray-500">
              Check if the server is running on port 8000
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
          
          {/* Projects Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VXML Processing Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your voice menu analysis projects and monitor processing status
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Search and Filters */}
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
            
            <div className="flex items-center gap-2">
              <Link to="/projects">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Manage All
                </Button>
              </Link>
              
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.key}
                project={project}
                onUpload={() => handleUpload(project)}
                onManage={() => handleManage(project)}
                onDelete={() => handleDelete(project)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
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
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <ProjectManagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <ProjectManagementModal
        isOpen={!!manageProject}
        onClose={() => setManageProject(null)}
        project={manageProject}
        mode="edit"
      />

      <UploadModal
        isOpen={!!uploadProject}
        onClose={() => setUploadProject(null)}
        projectKey={uploadProject?.key}
      />

      <DeleteProjectDialog
        isOpen={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        project={deleteProject}
      />
    </div>
  );
};

export default Index;
