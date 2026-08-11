export interface Organization {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  cpf_cnpj?: string;
  birth_date?: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: string;
  organization_id: string;
  customer_id: string;
  brand: string;
  model: string;
  year?: number;
  plate?: string;
  color?: string;
  mileage?: number;
  fuel_type?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerWithVehicles extends Customer {
  vehicles: Vehicle[];
  vehicles_count: number;
}

export interface VehicleWithCustomer extends Vehicle {
  customer?: Customer;
}

export interface ReturnCustomerItem {
  id: string;
  clientName: string;
  vehicle: string;
  service: string;
  nextReturnDate: string;
  status: 'hoje' | 'em_3_dias' | 'em_4_dias' | 'em_7_dias' | 'atrasado';
  statusLabel: string;
  phone?: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  iconName?: string;
}

export interface RevenueDataPoint {
  month: string;
  receita: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
