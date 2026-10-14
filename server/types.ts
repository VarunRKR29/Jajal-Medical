export type UserRole = 'admin' | 'viewer' | 'engineer';

export type CaseStatus = 'Draft' | 'Planning' | 'In Review' | 'Approved' | 'Completed' | 'Cancelled';

export type CasePriority = 'Low' | 'Medium' | 'High';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalCase {
  id: number;
  case_number: string; // e.g. CASE-0001 (Unique)
  patient_reference: string; // Dummy code, e.g. PT-89104
  surgeon_name: string;
  implant_type: string;
  status: CaseStatus;
  priority: CasePriority;
  surgery_date: string | null; // YYYY-MM-DD
  created_by: number; // Foreign key to users.id
  creator?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
  notes?: string;
  hospital_site?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedCasesData {
  cases: MedicalCase[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  stats: {
    total: number;
    draft: number;
    planning: number;
    in_review: number;
    approved: number;
    completed: number;
    cancelled: number;
  };
}
