import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  Settings, 
  FileText, 
  Activity,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

interface ProjectSidebarProps {
  className?: string;
  onNewProject?: () => void;
}

interface ProjectTreeItemProps {
  project: {
    key: string;
    name: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  currentProjectKey?: string;
}

const ProjectTreeItem: React.FC<ProjectTreeItemProps> = ({ 
  project, 
  isExpanded, 
  onToggle, 
  currentProjectKey 
}) => {
  const location = useLocation();
  
  const isActive = currentProjectKey === project.key;
  // TODO: Add individual project progress tracking
  const failedCount = 0;
  
  const menuItems = [
    { name: 'Overview', path: `/projects/${project.key}`, icon: Home },
    { name: 'Files', path: `/projects/${project.key}/files`, icon: FileText },
    { name: 'Status', path: `/projects/${project.key}/status`, icon: Activity },
    { name: 'Settings', path: `/projects/${project.key}/settings`, icon: Settings },
  ];

  return (
    <div className="mb-2">
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
          isActive && "bg-blue-50 text-blue-700"
        )}
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        <FolderOpen className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium truncate flex-1">{project.name}</span>
        {failedCount > 0 && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {failedCount}
          </span>
        )}
      </div>
      
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {menuItems.map((item) => {
            const isItemActive = location.pathname === item.path;
            const showFailedIndicator = item.name === 'Status' && failedCount > 0;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md text-sm transition-colors",
                  isItemActive
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.name}</span>
                {showFailedIndicator && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                    {failedCount} Failed ❗
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  className, 
  onNewProject 
}) => {
  const location = useLocation();
  const params = useParams();
  const { data: projects, isLoading } = useProjects();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const currentProjectKey = params.projectKey;

  // Auto-expand current project
  React.useEffect(() => {
    if (currentProjectKey) {
      setExpandedProjects(prev => new Set(prev.add(currentProjectKey)));
    }
  }, [currentProjectKey]);

  const toggleProject = (projectKey: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectKey)) {
        newSet.delete(projectKey);
      } else {
        newSet.add(projectKey);
      }
      return newSet;
    });
  };

  const isDashboardActive = location.pathname === '/';

  return (
    <div className={cn("flex h-full w-64 flex-col bg-white border-r border-gray-200", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Aumne.ai</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6 overflow-y-auto">
        {/* Dashboard Link */}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors mb-4",
            isDashboardActive
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
          )}
        >
          <Home className={cn("h-5 w-5", isDashboardActive ? "text-blue-700" : "text-gray-400")} />
          Dashboard
        </Link>

        {/* Projects Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              📁 Projects
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewProject}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {isLoading ? (
              <div className="text-sm text-gray-500 p-2">Loading projects...</div>
            ) : projects && projects.length > 0 ? (
              projects.map((project) => (
                <ProjectTreeItem
                  key={project.key}
                  project={project}
                  isExpanded={expandedProjects.has(project.key)}
                  onToggle={() => toggleProject(project.key)}
                  currentProjectKey={currentProjectKey}
                />
              ))
            ) : (
              <div className="text-sm text-gray-500 p-2">
                No projects yet
              </div>
            )}
          </div>
        </div>

        {/* Create Project Button */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            onClick={onNewProject}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </nav>
    </div>
  );
};