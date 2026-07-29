export interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  logo_url: string | null;
  ifu_number: string | null;
  rccm_number: string | null;
  is_active: number;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  role: 'super_admin' | 'tenant_admin' | 'manager' | 'caissier' | 'magasinier' | 'auditeur' | 'livreur';
  is_active: number;
  last_login_at: string | null;
  tenant?: Tenant;
  sites?: Site[];
}

export interface Site {
  id: string;
  tenant_id: string;
  name: string;
  type: 'siege' | 'annexe' | 'entrepot' | 'boutique';
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  tenant?: Tenant;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
