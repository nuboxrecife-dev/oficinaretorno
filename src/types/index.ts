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

// ==========================================
// ETAPA 3: CATÁLOGO E REGISTRO DE SERVIÇOS
// ==========================================

export interface ServiceType {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  default_interval_months?: number;
  default_interval_km?: number;
  default_price?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ReturnStatus =
  | 'scheduled'
  | 'due_soon'
  | 'due'
  | 'overdue'
  | 'contacted'
  | 'booked'
  | 'completed'
  | 'cancelled';

export interface ServiceRecord {
  id: string;
  organization_id: string;
  customer_id: string;
  vehicle_id: string;
  service_type_id?: string;
  service_date: string; // YYYY-MM-DD
  mileage: number;
  price: number;
  notes?: string;
  next_return_date?: string; // YYYY-MM-DD
  next_return_mileage?: number;
  return_status?: ReturnStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRecordWithDetails extends ServiceRecord {
  service_type?: ServiceType;
  customer?: Customer;
  vehicle?: Vehicle;
  computed_status?: 'scheduled' | 'due_soon' | 'due' | 'overdue';
  status_label?: string;
}

export interface ReturnCustomerItem {
  id: string; // service_record_id
  service_record: ServiceRecordWithDetails;
  customer: Customer;
  vehicle: Vehicle;
  service_name: string;
  last_service_date: string;
  last_service_mileage: number;
  next_return_date?: string;
  next_return_mileage?: number;
  status: 'scheduled' | 'due_soon' | 'due' | 'overdue';
  status_label: string;
  phone?: string;
  whatsapp?: string;
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

