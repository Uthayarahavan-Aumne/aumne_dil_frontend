
const API_BASE_URL = 'http://localhost:8000';

export interface Project {
  key: string;
  name: string;
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
  status: 'queued' | 'processing' | 'completed' | 'failed';
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
  db_config: {
    uri: string;
    user: string;
    password: string;
    database: string;
  };
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Authorization': 'Bearer demo_token',
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
      
      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : undefined as T;
      } else {
        // For void responses or empty bodies, return undefined
        return undefined as T;
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
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
        'Authorization': 'Bearer demo_token',
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }

  async getUploads(): Promise<UploadJob[]> {
    return this.request<UploadJob[]>('/uploads');
  }

  async getFileProgress(projectKey: string): Promise<FileProgress> {
    return this.request<FileProgress>(`/uploads/progress/${projectKey}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient();
