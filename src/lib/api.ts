
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Project {
  key: string;
  name: string;
  description?: string;
  userid?: string;
  db_config: {
    uri: string;
    user: string;
    password: string;
    database: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UploadJob {
  id: string;
  project_key: string;
  file_name: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  created_at: string;
  error_message?: string;
}

export interface FileProgress {
  project_key: string;
  total_files: number;
  processed_files: number;
  failed_files: number;
  pending_files: number;
  processing_files: number;
  progress_percentage: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  userid?: string;
  db_config: {
    uri: string;
    user: string;
    password: string;
    database: string;
  };
}

export type DatabaseStatus = 'active' | 'error' | 'checking';

export interface DatabaseHealth {
  project_key: string;
  project_name: string;
  database_uri: string;
  status: DatabaseStatus;
  response_time_ms?: number;
  error_message?: string;
  last_checked: string;
}

export interface DatabaseHealthSummary {
  total_databases: number;
  active_databases: number;
  error_databases: number;
  checking_databases: number;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from localStorage, environment, or use demo token
    const token = localStorage.getItem('access_token') || import.meta.env.VITE_API_TOKEN || 'demo_token';
    
    const config: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Always try to parse as JSON first for API responses
      const text = await response.text();
      
      if (text) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          return undefined as T;
        }
      } else {
        return undefined as T;
      }
    } catch (error) {
      throw error;
    }
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/v1/projects');
  }

  async getProject(key: string): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${key}`);
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    return this.request<Project>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(key: string, data: Partial<CreateProjectData>): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(key: string): Promise<void> {
    return this.request<void>(`/api/v1/projects/${key}`, {
      method: 'DELETE',
    });
  }

  // Upload endpoints
  async uploadFile(projectKey: string, file: File): Promise<UploadJob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_key', projectKey);

    return this.request<UploadJob>('/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token') || import.meta.env.VITE_API_TOKEN || 'demo_token'}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }

  async getProjectFiles(projectKey: string): Promise<UploadJob[]> {
    const response = await this.request<{
      project_key: string;
      project_name: string;
      total_files: number;
      files: Array<{
        id: number;
        file_name: string;
        status: string;
        error_message?: string;
        created_at: string;
        updated_at: string;
      }>;
      status_summary: object;
    }>(`/api/v1/projects/${projectKey}/files`);
    
    // Transform backend response to match frontend UploadJob interface
    return response.files.map(file => ({
      id: file.id.toString(),
      project_key: projectKey,
      file_name: file.file_name,
      status: file.status as 'pending' | 'processing' | 'processed' | 'failed',
      created_at: file.created_at,
      error_message: file.error_message
    }));
  }

  async getFileProgress(projectKey: string): Promise<FileProgress> {
    return this.request<FileProgress>(`/uploads/progress/${projectKey}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // Database health endpoints
  async getDatabaseHealth(): Promise<DatabaseHealth[]> {
    return this.request<DatabaseHealth[]>('/api/v1/database/health');
  }

  async getDatabaseHealthSummary(): Promise<DatabaseHealthSummary> {
    return this.request<DatabaseHealthSummary>('/api/v1/database/health/summary');
  }

  async getProjectDatabaseHealth(projectKey: string): Promise<DatabaseHealth> {
    return this.request<DatabaseHealth>(`/api/v1/database/health/${projectKey}`);
  }

  // Generic method for GET requests
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
}

export const apiClient = new ApiClient();
