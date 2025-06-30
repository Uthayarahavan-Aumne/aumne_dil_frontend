
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useRefreshDatabaseHealth } from '@/hooks/useDatabaseHealth';
import { Project, CreateProjectData } from '@/lib/api';

interface ProjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  mode: 'create' | 'edit';
}

export const ProjectManagementModal = ({
  isOpen,
  onClose,
  project,
  mode,
}: ProjectManagementModalProps) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    db_config: {
      uri: '',
      user: 'neo4j',
      password: '',
      database: '',
    },
  });

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const { refreshProjectHealth } = useRefreshDatabaseHealth();

  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        name: project.name,
        db_config: project.db_config,
      });
    } else {
      setFormData({
        name: '',
        db_config: {
          uri: '',
          user: 'neo4j',
          password: '',
          database: '',
        },
      });
    }
  }, [mode, project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        const newProject = await createMutation.mutateAsync(formData);
        // Trigger health check for newly created project
        setTimeout(() => refreshProjectHealth(newProject.key), 500);
      } else if (mode === 'edit' && project) {
        await updateMutation.mutateAsync({
          key: project.key,
          data: formData,
        });
        // Trigger health check for updated project (credentials may have changed)
        setTimeout(() => refreshProjectHealth(project.key), 500);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Neo4j Configuration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="uri">Database URI</Label>
              <Input
                id="uri"
                value={formData.db_config.uri}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    db_config: { ...prev.db_config, uri: e.target.value },
                  }))
                }
                placeholder="neo4j+s://xxxxx.databases.neo4j.io"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Username</Label>
              <Input
                id="user"
                value={formData.db_config.user}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    db_config: { ...prev.db_config, user: e.target.value },
                  }))
                }
                placeholder="neo4j"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.db_config.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    db_config: { ...prev.db_config, password: e.target.value },
                  }))
                }
                placeholder="Enter database password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="database">Database Name</Label>
              <Input
                id="database"
                value={formData.db_config.database}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    db_config: { ...prev.db_config, database: e.target.value },
                  }))
                }
                placeholder="Enter database name"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
