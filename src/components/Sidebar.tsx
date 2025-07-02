import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  Settings, 
  Database, 
  FileText, 
  BarChart3,
  Users,
  HelpCircle
} from 'lucide-react';
// import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    current: true,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    current: false,
  },
  {
    name: 'Files',
    href: '/files',
    icon: FileText,
    current: false,
    disabled: true,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    current: false,
    disabled: true,
  },
  {
    name: 'Database',
    href: '/database',
    icon: Database,
    current: false,
    disabled: true,
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    current: false,
    disabled: true,
  },
];

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    disabled: true,
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    disabled: true,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();

  return (
    <div className={`flex h-full w-64 flex-col bg-white border-r border-gray-200 ${className || ''}`}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Aumne.ai</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {/* Primary Navigation */}
          <li>
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    {item.disabled ? (
                      <div className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 text-gray-400 cursor-not-allowed">
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                        <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Soon</span>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`${isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'} group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors`}
                      >
                        <item.icon
                          className={`${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700'} h-5 w-5 shrink-0`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Secondary Navigation */}
          <li className="mt-auto">
            <ul role="list" className="space-y-1 border-t border-gray-200 pt-4">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  {item.disabled ? (
                    <div className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 text-gray-400 cursor-not-allowed">
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {item.name}
                      <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Soon</span>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                    >
                      <item.icon
                        className="text-gray-400 group-hover:text-blue-700 h-5 w-5 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};