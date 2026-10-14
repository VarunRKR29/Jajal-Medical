import { ApiResponse, MedicalCase, PaginatedCasesResult, PublicHoliday, User } from '../types.js';

const TOKEN_KEY = 'medcase_sanctum_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: `Server returned HTTP ${response.status}`,
    data: null,
  }));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`) as Error & {
      status?: number;
      errors?: Record<string, string[]>;
      payload?: unknown;
    };
    error.status = response.status;
    error.errors = data.errors;
    error.payload = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  async login(email: string, password: string):Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await apiRequest<{ token: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      const res = await apiRequest<null>('/api/logout', {
        method: 'POST',
      });
      return res;
    } finally {
      setStoredToken(null);
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiRequest<User>('/api/user');
  },

  // Cases
  async getCases(params: {
    page?: number;
    per_page?: number;
    search?: string;
    search_field?: 'all' | 'case_number' | 'surgeon_name' | 'patient_reference';
    status?: string;
    priority?: string;
    surgeon?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedCasesResult>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.search) query.set('search', params.search);
    if (params.search_field && params.search_field !== 'all') query.set('search_field', params.search_field);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.priority && params.priority !== 'All') query.set('priority', params.priority);
    if (params.surgeon && params.surgeon !== 'All') query.set('surgeon', params.surgeon);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_direction) query.set('sort_direction', params.sort_direction);

    return apiRequest<PaginatedCasesResult>(`/api/cases?${query.toString()}`);
  },

  async getCaseById(id: number): Promise<ApiResponse<MedicalCase>> {
    return apiRequest<MedicalCase>(`/api/cases/${id}`);
  },

  async createCase(caseData: Partial<MedicalCase>): Promise<ApiResponse<MedicalCase>> {
    return apiRequest<MedicalCase>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  async updateCase(id: number, caseData: Partial<MedicalCase>): Promise<ApiResponse<MedicalCase>> {
    return apiRequest<MedicalCase>(`/api/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    });
  },

  async deleteCase(id: number): Promise<ApiResponse<null>> {
    return apiRequest<null>(`/api/cases/${id}`, {
      method: 'DELETE',
    });
  },

  // Utilities
  async getHolidays(year = '2026', country = 'US'): Promise<ApiResponse<PublicHoliday[]>> {
    return apiRequest<PublicHoliday[]>(`/api/holidays?year=${year}&country=${country}`);
  },

  async resetDatabase(): Promise<ApiResponse<null>> {
    return apiRequest<null>('/api/reset-db', {
      method: 'POST',
    });
  },
};
