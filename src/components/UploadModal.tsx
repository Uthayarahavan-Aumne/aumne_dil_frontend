import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadFile } from '@/hooks/useUpload';
import { useProjects } from '@/hooks/useProjects';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import { UploadProgress } from './upload/UploadProgress';
import { UploadQueue } from './upload/UploadQueue';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectKey?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, projectKey }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [selectedProjectKey, setSelectedProjectKey] = useState(projectKey || '');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentUploadJob, setCurrentUploadJob] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadFile();
  const { data: projects } = useProjects();
  const { stages, currentStage, fileProgress } = useUploadProgress(currentUploadJob, selectedProjectKey);

  // Update selectedProjectKey when projectKey prop changes
  useEffect(() => {
    console.log('UploadModal projectKey prop:', projectKey);
    if (projectKey) {
      setSelectedProjectKey(projectKey);
      console.log('Set selectedProjectKey to:', projectKey);
    }
  }, [projectKey]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    const validFiles = files.filter(file => 
      file.name.endsWith('.vxml') || file.name.endsWith('.zip')
    );
    console.log('Valid files after filtering:', validFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    setSelectedFiles(validFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log('Selected files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      const validFiles = files.filter(file => 
        file.name.endsWith('.vxml') || file.name.endsWith('.zip')
      );
      console.log('Valid files after filtering:', validFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (!selectedProjectKey || selectedFiles.length === 0) return;

    setUploadStatus('uploading');

    try {
      const uploadJob = await uploadMutation.mutateAsync({
        projectKey: selectedProjectKey,
        file: selectedFiles[0],
      });

      setCurrentUploadJob(uploadJob);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  };

  const resetModal = () => {
    setUploadStatus('idle');
    setSelectedFiles([]);
    setDragActive(false);
    setCurrentUploadJob(null);
    if (!projectKey) {
      setSelectedProjectKey('');
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getSelectedProject = () => {
    return projects?.find(p => p.key === selectedProjectKey);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Upload VXML Files
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Upload your VXML or ZIP files for processing
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {uploadStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-medium">Upload completed successfully!</p>
              <p className="text-sm text-gray-500 mt-2">
                Your files are being processed in the background.
              </p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Upload failed</p>
              <p className="text-sm text-gray-500 mt-2">
                Please check your connection and try again.
              </p>
              <Button 
                onClick={() => setUploadStatus('idle')}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : uploadStatus === 'uploading' ? (
            <div className="py-8">
              <div className="text-center">
                <p className="text-gray-600">Uploading to {getSelectedProject()?.name}...</p>
              </div>
              <UploadProgress 
                stages={stages}
                currentStage={currentStage}
                fileProgress={fileProgress}
              />
            </div>
          ) : (
            <>
              {/* Project Selection */}
              {!projectKey && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Project</label>
                  <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project.key} value={project.key}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                  "hover:border-gray-400"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  <span 
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose files
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  Only .vxml and .zip files are supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".vxml,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Selected Files</label>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <File className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {file.size < 1024 * 1024 
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / 1024 / 1024).toFixed(2)} MB`
                        }
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {uploadStatus === 'idle' && (
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={resetModal} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('Upload button clicked. Project key:', selectedProjectKey, 'Files count:', selectedFiles.length);
                handleUpload();
              }} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedProjectKey || selectedFiles.length === 0}
            >
              Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </Button>
          </div>
        )}

        {uploadStatus === 'success' && (
          <Button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700">
            Done
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
