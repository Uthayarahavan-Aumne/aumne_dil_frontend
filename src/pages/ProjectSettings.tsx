import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Navbar } from '@/components/Navbar';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { useProjectDatabaseHealth } from '@/hooks/useDatabaseHealth';
import { apiClient } from '@/lib/api';
import { 
  FolderOpen, 
  Settings,
  Database,
  Save,
  Trash2,
  TestTube,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const ProjectSettings = () => {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: dbHealth } = useProjectDatabaseHealth(projectKey || '');
  
  const project = projects?.find(p => p.key === projectKey);

  // Form state
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    uri: project?.db_config.uri || '',
    user: project?.db_config.user || '',
    password: '',
    database: project?.db_config.database || ''
  });

  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        uri: project.db_config.uri,
        user: project.db_config.user,
        password: '',
        database: project.db_config.database
      });
    }
  }, [project]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!project) return;
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        db_config: {
          uri: formData.uri,
          user: formData.user,
          password: formData.password || project.db_config.password,
          database: formData.database
        }
      };
      
      await apiClient.updateProject(project.key, updateData);
      // TODO: Show success message
    } catch (error) {
      // TODO: Show error message
    }
  };

  const handleTestConnection = () => {
    // TODO: Implement test connection logic
  };

  const handleDeleteProject = () => {
    setIsDeleteModalOpen(true);
  };

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
        <div className="flex-1">
          <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-80 mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProjectSidebar onNewProject={() => setIsCreateModalOpen(true)} />
      <div className="flex-1">
        <Navbar onNewProject={() => setIsCreateModalOpen(true)} />
        
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {project.name} - Settings
            </h1>
            <p className="text-gray-600 mb-2">
              Configure project settings and database connection
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Created by: {project.userid || 'Unknown'}</p>
              <p>Last updated: {project.updated_at ? new Date(project.updated_at).toLocaleString() : 'Not available'}</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Project Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="key">Project Key</Label>
                  <Input
                    id="key"
                    value={project.key}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Project description (optional)"
                  rows={3}
                />
              </div>
            </div>

            {/* Database Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Neo4j Database Configuration</h2>
                </div>
                <div className="flex items-center gap-2">
                  {dbHealth?.status === 'active' ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Not Connected</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="uri">Connection URI</Label>
                  <Input
                    id="uri"
                    value={formData.uri}
                    onChange={(e) => handleInputChange('uri', e.target.value)}
                    placeholder="bolt://localhost:7687"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Neo4j connection URI (e.g., bolt://localhost:7687)
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user">Username</Label>
                    <Input
                      id="user"
                      value={formData.user}
                      onChange={(e) => handleInputChange('user', e.target.value)}
                      placeholder="neo4j"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password (leave empty to keep current)"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="database">Database Name</Label>
                  <Input
                    id="database"
                    value={formData.database}
                    onChange={(e) => handleInputChange('database', e.target.value)}
                    placeholder="neo4j"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                  <p className="text-sm text-gray-500">Save changes or navigate to next stage</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => navigate(`/projects/${projectKey}/data-input`)}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Next: Data Input
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Delete Project</h4>
                  <p className="text-sm text-gray-500">
                    Permanently delete this project and all associated data
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDeleteProject}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
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

      <DeleteProjectDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        project={project}
      />
    </div>
  );
};

export default ProjectSettings;