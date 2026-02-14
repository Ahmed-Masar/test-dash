import { apiHelpers } from './axios';

// Types
export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  totalCompanies?: number;
  totalClients?: number;
  totalProjects?: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiHelpers.post<ApiResponse<{ user: any; accessToken: string }>>('/auth/login', credentials),

  me: () =>
    apiHelpers.get<ApiResponse<{ user: any }>>('/auth/me'),

  logout: () =>
    apiHelpers.post<ApiResponse>('/auth/logout'),
};

// Companies API
export const companiesAPI = {
  getAll: (params: PaginationParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    return apiHelpers.get<ApiResponse<{ companies: any[]; pagination: PaginationResponse }>>(
      `/companies?${queryParams.toString()}`
    );
  },

  getById: (id: string) =>
    apiHelpers.get<ApiResponse<{ company: any }>>(`/companies/${id}`),

  create: (data: { name: string; logo?: File; customFields?: Record<string, any> }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.logo) formData.append('logo', data.logo);
    if (data.customFields) {
      formData.append('customFields', JSON.stringify(data.customFields));
    }
    
    return apiHelpers.upload<ApiResponse<{ company: any }>>('/companies', formData);
  },

  update: (id: string, data: { name?: string; logo?: File; customFields?: Record<string, any> }) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.logo) formData.append('logo', data.logo);
    if (data.customFields) {
      formData.append('customFields', JSON.stringify(data.customFields));
    }
    
    return apiHelpers.upload<ApiResponse<{ company: any }>>(`/companies/${id}`, formData, {
      method: 'PATCH',
    });
  },

  delete: (id: string) =>
    apiHelpers.delete<ApiResponse>(`/companies/${id}`),
};

// Clients API
export const clientsAPI = {
  getAll: (params: PaginationParams & { companyId?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.companyId) queryParams.append('companyId', params.companyId);
    
    return apiHelpers.get<ApiResponse<{ clients: any[]; pagination: PaginationResponse }>>(
      `/clients?${queryParams.toString()}`
    );
  },

  getById: (id: string) =>
    apiHelpers.get<ApiResponse<{ client: any }>>(`/clients/${id}`),

  create: (data: { 
    name: string; 
    email: string; 
    phone: string; 
    companyId: string; 
    avatar?: File; 
    customFields?: Record<string, any> 
  }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('companyId', data.companyId);
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.customFields) {
      formData.append('customFields', JSON.stringify(data.customFields));
    }
    
    return apiHelpers.upload<ApiResponse<{ client: any }>>('/clients', formData);
  },

  update: (id: string, data: { 
    name?: string; 
    email?: string; 
    phone?: string; 
    companyId?: string; 
    avatar?: File; 
    customFields?: Record<string, any> 
  }) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.companyId) formData.append('companyId', data.companyId);
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.customFields) {
      formData.append('customFields', JSON.stringify(data.customFields));
    }
    
    return apiHelpers.upload<ApiResponse<{ client: any }>>(`/clients/${id}`, formData, {
      method: 'PATCH',
    });
  },

  delete: (id: string) =>
    apiHelpers.delete<ApiResponse>(`/clients/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: (params: PaginationParams & { clientId?: string; status?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.clientId) queryParams.append('clientId', params.clientId);
    if (params.status) queryParams.append('status', params.status);
    
    return apiHelpers.get<ApiResponse<{ projects: any[]; pagination: PaginationResponse }>>(
      `/projects?${queryParams.toString()}`
    );
  },

  getById: (id: string) =>
    apiHelpers.get<ApiResponse<{ project: any }>>(`/projects/${id}`),

  create: (data: { 
    name: string; 
    clientId: string; 
    status: string; 
    images?: File[]; 
    customFields?: Record<string, any> 
  }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('clientId', data.clientId);
    formData.append('status', data.status);
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }
    
    if (data.customFields) {
      formData.append('customFields', JSON.stringify(data.customFields));
    }
    
    return apiHelpers.upload<ApiResponse<{ project: any }>>('/projects', formData);
  },

  update: (id: string, data: { 
    name?: string; 
    clientId?: string; 
    status?: string; 
    images?: File[]; 
    customFields?: Record<string, any> 
  }) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.clientId) formData.append('clientId', data.clientId);
    if (data.status) formData.append('status', data.status);
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }
    
    if (data.customFields) {
      formData.append('customFields', JSON.stringify(data.customFields));
    }
    
    return apiHelpers.upload<ApiResponse<{ project: any }>>(`/projects/${id}`, formData, {
      method: 'PATCH',
    });
  },

  delete: (id: string) =>
    apiHelpers.delete<ApiResponse>(`/projects/${id}`),
};

// Fields API
export const fieldsAPI = {
  getAll: (entityType: 'company' | 'client' | 'project') =>
    apiHelpers.get<ApiResponse<{ fields: any[] }>>(`/fields/${entityType}`),

  create: (entityType: 'company' | 'client' | 'project', fieldData: {
    fieldKey: string;
    fieldLabel: string;
    fieldType: string;
    options?: string[];
    required?: boolean;
    order?: number;
    validation?: any;
    description?: string;
  }) =>
    apiHelpers.post<ApiResponse<{ field: any }>>(`/fields/${entityType}`, fieldData),

  update: (fieldId: string, fieldData: {
    fieldLabel?: string;
    fieldType?: string;
    options?: string[];
    required?: boolean;
    order?: number;
    validation?: any;
    description?: string;
  }) =>
    apiHelpers.put<ApiResponse<{ field: any }>>(`/fields/${fieldId}`, fieldData),

  toggleStatus: (fieldId: string) =>
    apiHelpers.patch<ApiResponse<{ field: any }>>(`/fields/${fieldId}/toggle`),

  delete: (fieldId: string) =>
    apiHelpers.delete<ApiResponse>(`/fields/${fieldId}`),

  reorder: (entityType: 'company' | 'client' | 'project', fieldOrders: Array<{ fieldId: string; order: number }>) =>
    apiHelpers.patch<ApiResponse>(`/fields/${entityType}/reorder`, { fieldOrders }),
};

// Export all APIs
export const api = {
  auth: authAPI,
  companies: companiesAPI,
  clients: clientsAPI,
  projects: projectsAPI,
  fields: fieldsAPI,
};
