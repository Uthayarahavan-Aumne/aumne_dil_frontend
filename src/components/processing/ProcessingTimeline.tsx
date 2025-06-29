
import React from 'react';
import { CheckCircle, Clock, AlertCircle, Upload, Cog, Eye } from 'lucide-react';
import { UploadJob } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface ProcessingTimelineProps {
  upload: UploadJob;
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({ upload }) => {
  const getTimelineSteps = () => {
    const steps = [
      {
        id: 'uploaded',
        label: 'File Uploaded',
        icon: Upload,
        status: 'completed',
        timestamp: upload.created_at,
      },
    ];

    if (upload.status === 'queued') {
      steps.push({
        id: 'queued',
        label: 'Queued for Processing',
        icon: Clock,
        status: 'active',
        timestamp: upload.created_at,
      });
    } else if (upload.status === 'processing') {
      steps.push(
        {
          id: 'queued',
          label: 'Queued for Processing',
          icon: Clock,
          status: 'completed',
          timestamp: upload.created_at,
        },
        {
          id: 'processing',
          label: 'Processing VXML',
          icon: Cog,
          status: 'active',
          timestamp: upload.created_at,
        }
      );
    } else if (upload.status === 'completed') {
      steps.push(
        {
          id: 'queued',
          label: 'Queued for Processing',
          icon: Clock,
          status: 'completed',
          timestamp: upload.created_at,
        },
        {
          id: 'processing',
          label: 'Processing VXML',
          icon: Cog,
          status: 'completed',
          timestamp: upload.created_at,
        },
        {
          id: 'completed',
          label: 'Processing Complete',
          icon: CheckCircle,
          status: 'completed',
          timestamp: upload.created_at,
        }
      );
    } else if (upload.status === 'failed') {
      steps.push(
        {
          id: 'queued',
          label: 'Queued for Processing',
          icon: Clock,
          status: 'completed',
          timestamp: upload.created_at,
        },
        {
          id: 'failed',
          label: 'Processing Failed',
          icon: AlertCircle,
          status: 'error',
          timestamp: upload.created_at,
        }
      );
    }

    return steps;
  };

  const steps = getTimelineSteps();

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Processing Timeline</h4>
      
      <div className="relative">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative flex items-start">
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${getStepColor(step.status)}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              
              <div className="ml-4 flex-1 min-w-0 pb-6">
                <p className="text-sm font-medium text-gray-900">
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(step.timestamp)}
                </p>
                
                {step.status === 'error' && upload.error_message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {upload.error_message}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
