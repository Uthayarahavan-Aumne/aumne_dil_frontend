import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Navbar } from '@/components/Navbar';
import { ProjectManagementModal } from '@/components/ProjectManagementModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';
import { 
  ArrowLeft,
  Folder,
  Settings,
  Database,
  Zap,
  Clock
} from 'lucide-react';

const ProjectKBConfiguration = () => {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: projects, isLoading: projectsLoading } = useProjects();
  
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
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
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
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
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
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {project.name} - Knowledge Base Configuration
                </h1>
                <p className="text-gray-600">
                  Configure the knowledge base for intelligent voice flow generation
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Knowledge Base Configuration
              </CardTitle>
              <CardDescription className="text-lg">
                This feature is coming soon and will enable intelligent voice flow pattern matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">Pattern Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Analyze uploaded VXML files to extract patterns and create knowledge base
                  </p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Zap className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">Goal Mapping</h3>
                  <p className="text-sm text-gray-600">
                    Input new voice flow goals and map them to existing patterns intelligently
                  </p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">Flow Generation</h3>
                  <p className="text-sm text-gray-600">
                    Generate new voice flows based on learned patterns and user requirements
                  </p>
                </div>
              </div>
              
              <div className="text-center p-8 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h4 className="text-lg font-medium text-blue-900 mb-2">
                  Phase 2 Development
                </h4>
                <p className="text-blue-700 mb-4">
                  This advanced feature is currently in development and will be available in the next release.
                  It will provide intelligent pattern matching and automated voice flow generation capabilities.
                </p>
                <div className="flex justify-center">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Coming Soon
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={() => navigate(`/projects/${projectKey}/data-processing`)}
              variant="outline"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Data Processing
            </Button>
            
            <Button
              onClick={() => navigate(`/projects/${projectKey}/settings`)}
              variant="outline"
              size="lg"
            >
              Project Settings
              <Settings className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProjectManagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default ProjectKBConfiguration;