
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Search, Plus } from 'lucide-react';

interface NavbarProps {
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewProject }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Aumne.ai</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={onNewProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};
