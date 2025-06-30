
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'active' | 'error' | 'loading' | 'checking';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-700 border-green-200',
        };
      case 'queued':
        return {
          label: 'Queued',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
      case 'processing':
        return {
          label: 'Processing',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-700 border-green-200',
        };
      case 'failed':
        return {
          label: 'Failed',
          className: 'bg-red-100 text-red-700 border-red-200',
        };
      case 'error':
        return {
          label: 'Error',
          className: 'bg-orange-100 text-orange-700 border-orange-200',
        };
      case 'loading':
        return {
          label: 'Loading...',
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        };
      case 'checking':
        return {
          label: 'Checking...',
          className: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        };
    }
  };

  const { label, className: statusClassName } = getStatusConfig(status);

  return (
    <Badge
      variant="secondary"
      className={cn(statusClassName, className)}
    >
      {label}
    </Badge>
  );
};
