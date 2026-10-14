export type UserRole = 'admin' | 'viewer' | 'engineer';

export type CaseStatus = 'Draft' | 'Planning' | 'In Review' | 'Approved' | 'Completed' | 'Cancelled';

export type CasePriority = 'Low' | 'Medium' | 'High';

export type SearchField = 'all' | 'case_number' | 'surgeon_name' | 'patient_reference';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

export interface MedicalCase {
  id: number;
  case_number: string;
  patient_reference: string;
  surgeon_name: string;
  implant_type: string;
  status: CaseStatus;
  priority: CasePriority;
  surgery_date: string | null;
  created_by: number;
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

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface CaseStats {
  total: number;
  draft: number;
  planning: number;
  in_review: number;
  approved: number;
  completed: number;
  cancelled: number;
}

export interface PaginatedCasesResult {
  cases: MedicalCase[];
  pagination: PaginationMeta;
  stats: CaseStats;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
}
