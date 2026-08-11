import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Customer,
  Vehicle,
  CustomerWithVehicles,
  VehicleWithCustomer,
  PaginatedResult,
  ServiceType,
  ServiceRecord,
  ServiceRecordWithDetails,
  ReturnCustomerItem,
} from '@/types';

const LOCAL_CUSTOMERS_KEY = 'oficina_retorno_customers';
const LOCAL_VEHICLES_KEY = 'oficina_retorno_vehicles';
const LOCAL_SERVICE_TYPES_KEY = 'oficina_retorno_service_types';
const LOCAL_SERVICE_RECORDS_KEY = 'oficina_retorno_service_records';

// Seed de dados iniciais para testes imediatos sem Supabase
function getInitialSeedData() {
  const orgId = 'org-demo-123';
  const todayStr = new Date().toISOString().split('T')[0];

  const initialCustomers: Customer[] = [
    {
      id: 'cust-1',
      organization_id: orgId,
      name: 'João da Silva',
      phone: '(81) 3456-7890',
      whatsapp: '5581999999999',
      email: 'joao.silva@email.com',
      cpf_cnpj: '123.456.789-00',
      birth_date: '1985-05-12',
      status: 'active',
      notes: 'Cliente preferencial de revisões periódicas.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cust-2',
      organization_id: orgId,
      name: 'Maria Oliveira',
      phone: '(81) 3222-1111',
      whatsapp: '5581987654321',
      email: 'maria.oliveira@gmail.com',
      cpf_cnpj: '987.654.321-11',
      birth_date: '1990-11-20',
      status: 'active',
      notes: 'Sempre solicita troca de filtro de ar.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'cust-3',
      organization_id: orgId,
      name: 'Carlos Santos',
      phone: '(81) 97777-8888',
      whatsapp: '5581977778888',
      email: 'carlos.santos@bol.com.br',
      cpf_cnpj: '456.789.012-33',
      status: 'active',
      notes: 'Empresa de frota pequena.',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'cust-4',
      organization_id: orgId,
      name: 'Ana Paula',
      whatsapp: '5581966665555',
      email: 'ana.paula@outlook.com',
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ];

  const initialVehicles: Vehicle[] = [
    {
      id: 'veh-1',
      organization_id: orgId,
      customer_id: 'cust-1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      plate: 'ABC1D23',
      color: 'Prata',
      mileage: 90000,
      fuel_type: 'Flex',
      notes: 'Última revisão de 80.000 km realizada com sucesso.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'veh-2',
      organization_id: orgId,
      customer_id: 'cust-2',
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      plate: 'XYZ9A88',
      color: 'Preto',
      mileage: 62000,
      fuel_type: 'Flex',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'veh-3',
      organization_id: orgId,
      customer_id: 'cust-3',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2020,
      plate: 'KHM4433',
      color: 'Branco',
      mileage: 95000,
      fuel_type: 'Gasolina',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  const initialServiceTypes: ServiceType[] = [
    {
      id: 'st-1',
      organization_id: orgId,
      name: 'Troca de óleo',
      description: 'Troca de óleo do motor e filtro de óleo original',
      default_interval_months: 6,
      default_interval_km: 10000,
      default_price: 350,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'st-2',
      organization_id: orgId,
      name: 'Revisão preventiva',
      description: 'Checagem completa de 40 itens de segurança e substituição de filtros',
      default_interval_months: 12,
      default_interval_km: 10000,
      default_price: 450,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'st-3',
      organization_id: orgId,
      name: 'Alinhamento e balanceamento',
      description: 'Alinhamento 3D e balanceamento das 4 rodas',
      default_interval_months: 6,
      default_interval_km: 10000,
      default_price: 150,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'st-4',
      organization_id: orgId,
      name: 'Troca de pastilhas de freio',
      description: 'Substituição das pastilhas de freio dianteiras e sangria do fluido',
      default_interval_months: 12,
      default_interval_km: 20000,
      default_price: 380,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Calcular datas relativas para os registros de teste
  const now = new Date();
  const dateOverdue = new Date(now);
  dateOverdue.setDate(dateOverdue.getDate() - 15); // Atrasado há 15 dias

  const dateDueSoon = new Date(now);
  dateDueSoon.setDate(dateDueSoon.getDate() + 10); // Daqui a 10 dias

  const dateScheduled = new Date(now);
  dateScheduled.setMonth(dateScheduled.getMonth() + 6); // Daqui a 6 meses

  const initialServiceRecords: ServiceRecord[] = [
    // João da Silva - Corolla (Programado)
    {
      id: 'sr-1',
      organization_id: orgId,
      customer_id: 'cust-1',
      vehicle_id: 'veh-1',
      service_type_id: 'st-1',
      service_date: todayStr,
      mileage: 90000,
      price: 350,
      notes: 'Óleo sintético 5W30 trocado com sucesso.',
      next_return_date: dateScheduled.toISOString().split('T')[0],
      next_return_mileage: 100000,
      return_status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Maria Oliveira - Civic (Atrasado)
    {
      id: 'sr-2',
      organization_id: orgId,
      customer_id: 'cust-2',
      vehicle_id: 'veh-2',
      service_type_id: 'st-1',
      service_date: new Date(now.getTime() - 86400000 * 200).toISOString().split('T')[0],
      mileage: 52000,
      price: 250,
      notes: 'Revisão periódica.',
      next_return_date: dateOverdue.toISOString().split('T')[0],
      next_return_mileage: 60000,
      return_status: 'overdue',
      created_at: new Date(now.getTime() - 86400000 * 200).toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Carlos Santos - Golf (Retorno Próximo)
    {
      id: 'sr-3',
      organization_id: orgId,
      customer_id: 'cust-3',
      vehicle_id: 'veh-3',
      service_type_id: 'st-3',
      service_date: new Date(now.getTime() - 86400000 * 170).toISOString().split('T')[0],
      mileage: 85000,
      price: 150,
      notes: 'Alinhamento 3D realizado.',
      next_return_date: dateDueSoon.toISOString().split('T')[0],
      next_return_mileage: 95000,
      return_status: 'due_soon',
      created_at: new Date(now.getTime() - 86400000 * 170).toISOString(),
      updated_at: new Date().toISOString(),
    },
    // João da Silva - Corolla (Histórico anterior)
    {
      id: 'sr-4',
      organization_id: orgId,
      customer_id: 'cust-1',
      vehicle_id: 'veh-1',
      service_type_id: 'st-2',
      service_date: new Date(now.getTime() - 86400000 * 180).toISOString().split('T')[0],
      mileage: 80000,
      price: 450,
      notes: 'Revisão geral de 80.000 km.',
      next_return_date: todayStr,
      next_return_mileage: 90000,
      return_status: 'completed',
      created_at: new Date(now.getTime() - 86400000 * 180).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return { initialCustomers, initialVehicles, initialServiceTypes, initialServiceRecords };
}

// Helpers para LocalStorage Store
function getLocalStore() {
  if (typeof window === 'undefined') {
    return { customers: [], vehicles: [], serviceTypes: [], serviceRecords: [] };
  }

  let custStr = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
  let vehStr = localStorage.getItem(LOCAL_VEHICLES_KEY);
  let stStr = localStorage.getItem(LOCAL_SERVICE_TYPES_KEY);
  let srStr = localStorage.getItem(LOCAL_SERVICE_RECORDS_KEY);

  if (!custStr || !vehStr || !stStr || !srStr) {
    const seed = getInitialSeedData();
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(seed.initialCustomers));
    localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(seed.initialVehicles));
    localStorage.setItem(LOCAL_SERVICE_TYPES_KEY, JSON.stringify(seed.initialServiceTypes));
    localStorage.setItem(LOCAL_SERVICE_RECORDS_KEY, JSON.stringify(seed.initialServiceRecords));
    return {
      customers: seed.initialCustomers,
      vehicles: seed.initialVehicles,
      serviceTypes: seed.initialServiceTypes,
      serviceRecords: seed.initialServiceRecords,
    };
  }

  return {
    customers: JSON.parse(custStr) as Customer[],
    vehicles: JSON.parse(vehStr) as Vehicle[],
    serviceTypes: JSON.parse(stStr) as ServiceType[],
    serviceRecords: JSON.parse(srStr) as ServiceRecord[],
  };
}

function saveLocalStore(
  customers: Customer[],
  vehicles: Vehicle[],
  serviceTypes?: ServiceType[],
  serviceRecords?: ServiceRecord[]
) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(customers));
  localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(vehicles));

  if (serviceTypes) {
    localStorage.setItem(LOCAL_SERVICE_TYPES_KEY, JSON.stringify(serviceTypes));
  }
  if (serviceRecords) {
    localStorage.setItem(LOCAL_SERVICE_RECORDS_KEY, JSON.stringify(serviceRecords));
  }
}

// ============================================================
// LÓGICA E REGRAS DE CÁLCULO DO RETORNO (REQUISITOS 11, 22, 23, 24)
// ============================================================

export function computeReturnStatus(
  nextReturnDate?: string,
  nextReturnMileage?: number,
  currentVehicleMileage?: number
): { status: 'scheduled' | 'due_soon' | 'due' | 'overdue'; label: string } {
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  let dateStatus: 'scheduled' | 'due_soon' | 'due' | 'overdue' | null = null;
  let kmStatus: 'due' | null = null;

  // Verificação por Quilometragem (Req 23)
  if (
    nextReturnMileage !== undefined &&
    nextReturnMileage !== null &&
    currentVehicleMileage !== undefined &&
    currentVehicleMileage !== null
  ) {
    if (currentVehicleMileage >= nextReturnMileage) {
      kmStatus = 'due';
    }
  }

  // Verificação por Data (Req 22)
  if (nextReturnDate) {
    const returnDate = new Date(nextReturnDate);
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      dateStatus = 'overdue';
    } else if (diffDays === 0) {
      dateStatus = 'due';
    } else if (diffDays <= 30) {
      dateStatus = 'due_soon';
    } else {
      dateStatus = 'scheduled';
    }
  }

  // Prioridade de Status (Req 24): Se estiver vencido por KM OU por data, indica Retorno Necessário/Atrasado
  if (dateStatus === 'overdue') {
    return { status: 'overdue', label: 'Atrasado' };
  }

  if (kmStatus === 'due') {
    return { status: 'due', label: 'Retorno por KM Necessário' };
  }

  if (dateStatus === 'due') {
    return { status: 'due', label: 'Hoje' };
  }

  if (dateStatus === 'due_soon') {
    return { status: 'due_soon', label: 'Próximo (30 dias)' };
  }

  if (dateStatus === 'scheduled') {
    return { status: 'scheduled', label: 'Programado' };
  }

  return { status: 'scheduled', label: 'Programado' };
}

export function calculateNextReturn(
  serviceDateStr: string,
  mileage: number,
  monthsInterval?: number,
  kmInterval?: number
): { nextReturnDate?: string; nextReturnMileage?: number } {
  let nextReturnDate: string | undefined = undefined;
  let nextReturnMileage: string | number | undefined = undefined;

  if (monthsInterval && monthsInterval > 0) {
    const date = new Date(serviceDateStr);
    date.setMonth(date.getMonth() + Number(monthsInterval));
    nextReturnDate = date.toISOString().split('T')[0];
  }

  if (kmInterval && kmInterval > 0) {
    nextReturnMileage = Number(mileage) + Number(kmInterval);
  }

  return {
    nextReturnDate,
    nextReturnMileage: nextReturnMileage !== undefined ? Number(nextReturnMileage) : undefined,
  };
}

// ============================================================
// SERVIÇOS DE CLIENTES
// ============================================================

export async function getCustomers(
  organizationId: string,
  options: {
    query?: string;
    status?: 'all' | 'active' | 'inactive';
    hasVehicle?: 'all' | 'with' | 'without';
    sortBy?: 'recent' | 'name_asc' | 'name_desc' | 'oldest';
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PaginatedResult<CustomerWithVehicles>> {
  const { query = '', status = 'all', hasVehicle = 'all', sortBy = 'recent', page = 1, pageSize = 25 } = options;

  if (isSupabaseConfigured) {
    try {
      let req = supabase.from('customers').select('*, vehicles(*)', { count: 'exact' });
      req = req.eq('organization_id', organizationId);

      if (status !== 'all') {
        req = req.eq('status', status);
      }

      if (query.trim()) {
        const q = `%${query.trim()}%`;
        req = req.or(`name.ilike.${q},whatsapp.ilike.${q},phone.ilike.${q},email.ilike.${q},cpf_cnpj.ilike.${q}`);
      }

      if (sortBy === 'recent') req = req.order('updated_at', { ascending: false });
      else if (sortBy === 'oldest') req = req.order('created_at', { ascending: true });
      else if (sortBy === 'name_asc') req = req.order('name', { ascending: true });
      else if (sortBy === 'name_desc') req = req.order('name', { ascending: false });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      req = req.range(from, to);

      const { data, count, error } = await req;

      if (!error && data) {
        let items: CustomerWithVehicles[] = data.map((c: any) => ({
          ...c,
          vehicles: c.vehicles || [],
          vehicles_count: c.vehicles ? c.vehicles.length : 0,
        }));

        if (hasVehicle === 'with') items = items.filter((i) => i.vehicles_count > 0);
        if (hasVehicle === 'without') items = items.filter((i) => i.vehicles_count === 0);

        const total = count || items.length;

        return {
          data: items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize) || 1,
        };
      }
    } catch (err) {
      console.error('Erro no Supabase getCustomers:', err);
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  let filtered = store.customers.filter((c) => c.organization_id === organizationId);

  if (status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.whatsapp?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.cpf_cnpj?.toLowerCase().includes(q)
    );
  }

  let withVehicles: CustomerWithVehicles[] = filtered.map((c) => {
    const custVehicles = store.vehicles.filter((v) => v.customer_id === c.id);
    return {
      ...c,
      vehicles: custVehicles,
      vehicles_count: custVehicles.length,
    };
  });

  if (hasVehicle === 'with') withVehicles = withVehicles.filter((i) => i.vehicles_count > 0);
  if (hasVehicle === 'without') withVehicles = withVehicles.filter((i) => i.vehicles_count === 0);

  withVehicles.sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const total = withVehicles.length;
  const from = (page - 1) * pageSize;
  const pageData = withVehicles.slice(from, from + pageSize);

  return {
    data: pageData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getCustomerById(
  customerId: string,
  organizationId: string
): Promise<CustomerWithVehicles | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*, vehicles(*)')
        .eq('id', customerId)
        .eq('organization_id', organizationId)
        .single();

      if (!error && data) {
        return {
          ...data,
          vehicles: data.vehicles || [],
          vehicles_count: data.vehicles ? data.vehicles.length : 0,
        };
      }
    } catch (err) {
      console.error('Erro getCustomerById Supabase:', err);
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  const customer = store.customers.find((c) => c.id === customerId && c.organization_id === organizationId);
  if (!customer) return null;

  const custVehicles = store.vehicles.filter((v) => v.customer_id === customer.id);
  return {
    ...customer,
    vehicles: custVehicles,
    vehicles_count: custVehicles.length,
  };
}

export async function saveCustomer(
  organizationId: string,
  customerData: Partial<Customer>
): Promise<Customer> {
  const isEditing = Boolean(customerData.id);

  if (isSupabaseConfigured) {
    if (isEditing) {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          phone: customerData.phone,
          whatsapp: customerData.whatsapp,
          email: customerData.email,
          cpf_cnpj: customerData.cpf_cnpj,
          birth_date: customerData.birth_date || null,
          notes: customerData.notes,
          status: customerData.status || 'active',
        })
        .eq('id', customerData.id)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao atualizar cliente');
      return data;
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          organization_id: organizationId,
          name: customerData.name,
          phone: customerData.phone,
          whatsapp: customerData.whatsapp,
          email: customerData.email,
          cpf_cnpj: customerData.cpf_cnpj,
          birth_date: customerData.birth_date || null,
          notes: customerData.notes,
          status: customerData.status || 'active',
        })
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao criar cliente');
      return data;
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  let updatedCustomers = [...store.customers];

  if (isEditing) {
    const idx = updatedCustomers.findIndex((c) => c.id === customerData.id && c.organization_id === organizationId);
    if (idx === -1) throw new Error('Cliente não encontrado');

    const updated: Customer = {
      ...updatedCustomers[idx],
      ...customerData,
      updated_at: new Date().toISOString(),
    };
    updatedCustomers[idx] = updated;
    saveLocalStore(updatedCustomers, store.vehicles, store.serviceTypes, store.serviceRecords);
    return updated;
  } else {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      organization_id: organizationId,
      name: customerData.name || '',
      phone: customerData.phone,
      whatsapp: customerData.whatsapp,
      email: customerData.email,
      cpf_cnpj: customerData.cpf_cnpj,
      birth_date: customerData.birth_date,
      notes: customerData.notes,
      status: customerData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updatedCustomers.unshift(newCustomer);
    saveLocalStore(updatedCustomers, store.vehicles, store.serviceTypes, store.serviceRecords);
    return newCustomer;
  }
}

export async function deleteCustomer(customerId: string, organizationId: string): Promise<void> {
  const customer = await getCustomerById(customerId, organizationId);
  if (!customer) throw new Error('Cliente não encontrado');

  if (customer.vehicles_count > 0) {
    throw new Error(
      'Este cliente possui veículos cadastrados. Remova ou transfira os veículos antes de excluir o cliente.'
    );
  }

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)
      .eq('organization_id', organizationId);

    if (error) throw new Error(error.message);
    return;
  }

  // Local Storage Fallback
  const store = getLocalStore();
  const updatedCustomers = store.customers.filter((c) => c.id !== customerId);
  saveLocalStore(updatedCustomers, store.vehicles, store.serviceTypes, store.serviceRecords);
}

// ============================================================
// SERVIÇOS DE VEÍCULOS
// ============================================================

export async function getVehicles(
  organizationId: string,
  options: {
    query?: string;
    customerId?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PaginatedResult<VehicleWithCustomer>> {
  const { query = '', customerId, page = 1, pageSize = 25 } = options;

  if (isSupabaseConfigured) {
    try {
      let req = supabase.from('vehicles').select('*, customer:customers(*)', { count: 'exact' });
      req = req.eq('organization_id', organizationId);

      if (customerId) req = req.eq('customer_id', customerId);

      if (query.trim()) {
        const q = `%${query.trim()}%`;
        req = req.or(`brand.ilike.${q},model.ilike.${q},plate.ilike.${q}`);
      }

      req = req.order('updated_at', { ascending: false });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      req = req.range(from, to);

      const { data, count, error } = await req;
      if (!error && data) {
        return {
          data: data as VehicleWithCustomer[],
          total: count || data.length,
          page,
          pageSize,
          totalPages: Math.ceil((count || data.length) / pageSize) || 1,
        };
      }
    } catch (err) {
      console.error('Erro getVehicles Supabase:', err);
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  let filtered = store.vehicles.filter((v) => v.organization_id === organizationId);

  if (customerId) {
    filtered = filtered.filter((v) => v.customer_id === customerId);
  }

  let withCustomer: VehicleWithCustomer[] = filtered.map((v) => {
    const cust = store.customers.find((c) => c.id === v.customer_id);
    return { ...v, customer: cust };
  });

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    withCustomer = withCustomer.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.plate?.toLowerCase().includes(q) ||
        v.customer?.name.toLowerCase().includes(q)
    );
  }

  withCustomer.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

  const total = withCustomer.length;
  const from = (page - 1) * pageSize;
  const pageData = withCustomer.slice(from, from + pageSize);

  return {
    data: pageData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getVehicleById(
  vehicleId: string,
  organizationId: string
): Promise<VehicleWithCustomer | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, customer:customers(*)')
        .eq('id', vehicleId)
        .eq('organization_id', organizationId)
        .single();

      if (!error && data) {
        return data as VehicleWithCustomer;
      }
    } catch (err) {
      console.error('Erro getVehicleById Supabase:', err);
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  const vehicle = store.vehicles.find((v) => v.id === vehicleId && v.organization_id === organizationId);
  if (!vehicle) return null;

  const cust = store.customers.find((c) => c.id === vehicle.customer_id);
  return { ...vehicle, customer: cust };
}

export async function saveVehicle(
  organizationId: string,
  vehicleData: Partial<Vehicle>
): Promise<Vehicle> {
  const isEditing = Boolean(vehicleData.id);
  const cleanPlate = vehicleData.plate ? vehicleData.plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : undefined;
  const cleanMileage = Math.max(0, vehicleData.mileage || 0);

  if (!vehicleData.customer_id) throw new Error('O veículo deve estar associado a um cliente.');

  if (isSupabaseConfigured) {
    if (isEditing) {
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year ? Number(vehicleData.year) : null,
          plate: cleanPlate,
          color: vehicleData.color,
          mileage: cleanMileage,
          fuel_type: vehicleData.fuel_type,
          notes: vehicleData.notes,
        })
        .eq('id', vehicleData.id)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao atualizar veículo.');
      return data;
    } else {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          organization_id: organizationId,
          customer_id: vehicleData.customer_id,
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year ? Number(vehicleData.year) : null,
          plate: cleanPlate,
          color: vehicleData.color,
          mileage: cleanMileage,
          fuel_type: vehicleData.fuel_type,
          notes: vehicleData.notes,
        })
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao salvar veículo.');
      return data;
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  let updatedVehicles = [...store.vehicles];

  if (isEditing) {
    const idx = updatedVehicles.findIndex((v) => v.id === vehicleData.id && v.organization_id === organizationId);
    if (idx === -1) throw new Error('Veículo não encontrado');

    const updated: Vehicle = {
      ...updatedVehicles[idx],
      ...vehicleData,
      plate: cleanPlate,
      mileage: cleanMileage,
      updated_at: new Date().toISOString(),
    };
    updatedVehicles[idx] = updated;
    saveLocalStore(store.customers, updatedVehicles, store.serviceTypes, store.serviceRecords);
    return updated;
  } else {
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      organization_id: organizationId,
      customer_id: vehicleData.customer_id,
      brand: vehicleData.brand || '',
      model: vehicleData.model || '',
      year: vehicleData.year ? Number(vehicleData.year) : undefined,
      plate: cleanPlate,
      color: vehicleData.color,
      mileage: cleanMileage,
      fuel_type: vehicleData.fuel_type,
      notes: vehicleData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updatedVehicles.unshift(newVehicle);
    saveLocalStore(store.customers, updatedVehicles, store.serviceTypes, store.serviceRecords);
    return newVehicle;
  }
}

export async function deleteVehicle(vehicleId: string, organizationId: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .eq('organization_id', organizationId);

    if (error) throw new Error(error.message);
    return;
  }

  // Local Storage Fallback
  const store = getLocalStore();
  const updatedVehicles = store.vehicles.filter((v) => v.id !== vehicleId);
  saveLocalStore(store.customers, updatedVehicles, store.serviceTypes, store.serviceRecords);
}

// ============================================================
// ETAPA 3: CATÁLOGO DE SERVIÇOS (SERVICE TYPES)
// ============================================================

export async function getServiceTypes(
  organizationId: string,
  options: { query?: string; activeOnly?: boolean } = {}
): Promise<ServiceType[]> {
  const { query = '', activeOnly = false } = options;

  if (isSupabaseConfigured) {
    try {
      let req = supabase.from('service_types').select('*').eq('organization_id', organizationId);
      if (activeOnly) req = req.eq('active', true);
      if (query.trim()) req = req.ilike('name', `%${query.trim()}%`);
      req = req.order('name', { ascending: true });

      const { data, error } = await req;
      if (!error && data) return data as ServiceType[];
    } catch (err) {
      console.error('Erro getServiceTypes Supabase:', err);
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  let filtered = store.serviceTypes.filter((st) => st.organization_id === organizationId);
  if (activeOnly) filtered = filtered.filter((st) => st.active);
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter((st) => st.name.toLowerCase().includes(q) || st.description?.toLowerCase().includes(q));
  }
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

export async function getServiceTypeById(
  id: string,
  organizationId: string
): Promise<ServiceType | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();
      if (!error && data) return data as ServiceType;
    } catch (err) {
      console.error('Erro getServiceTypeById Supabase:', err);
    }
  }

  const store = getLocalStore();
  return store.serviceTypes.find((st) => st.id === id && st.organization_id === organizationId) || null;
}

export async function saveServiceType(
  organizationId: string,
  serviceData: Partial<ServiceType>
): Promise<ServiceType> {
  const isEditing = Boolean(serviceData.id);

  if (isSupabaseConfigured) {
    if (isEditing) {
      const { data, error } = await supabase
        .from('service_types')
        .update({
          name: serviceData.name,
          description: serviceData.description,
          default_interval_months: serviceData.default_interval_months || null,
          default_interval_km: serviceData.default_interval_km || null,
          default_price: serviceData.default_price || 0,
          active: serviceData.active !== undefined ? serviceData.active : true,
        })
        .eq('id', serviceData.id)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao atualizar serviço no catálogo.');
      return data as ServiceType;
    } else {
      const { data, error } = await supabase
        .from('service_types')
        .insert({
          organization_id: organizationId,
          name: serviceData.name,
          description: serviceData.description,
          default_interval_months: serviceData.default_interval_months || null,
          default_interval_km: serviceData.default_interval_km || null,
          default_price: serviceData.default_price || 0,
          active: serviceData.active !== undefined ? serviceData.active : true,
        })
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao criar serviço no catálogo.');
      return data as ServiceType;
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  let updatedTypes = [...store.serviceTypes];

  if (isEditing) {
    const idx = updatedTypes.findIndex((st) => st.id === serviceData.id && st.organization_id === organizationId);
    if (idx === -1) throw new Error('Serviço não encontrado');

    const updated: ServiceType = {
      ...updatedTypes[idx],
      ...serviceData,
      updated_at: new Date().toISOString(),
    };
    updatedTypes[idx] = updated;
    saveLocalStore(store.customers, store.vehicles, updatedTypes, store.serviceRecords);
    return updated;
  } else {
    const newSt: ServiceType = {
      id: `st-${Date.now()}`,
      organization_id: organizationId,
      name: serviceData.name || '',
      description: serviceData.description,
      default_interval_months: serviceData.default_interval_months,
      default_interval_km: serviceData.default_interval_km,
      default_price: serviceData.default_price || 0,
      active: serviceData.active !== undefined ? serviceData.active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updatedTypes.unshift(newSt);
    saveLocalStore(store.customers, store.vehicles, updatedTypes, store.serviceRecords);
    return newSt;
  }
}

export async function deleteServiceType(id: string, organizationId: string): Promise<{ softDeleted: boolean }> {
  // Requisito 5: Se o serviço já possuir registros associados, desativar em vez de excluir silenciosamente
  const store = getLocalStore();
  const recordsUsing = store.serviceRecords.filter(
    (sr) => sr.service_type_id === id && sr.organization_id === organizationId
  );

  if (recordsUsing.length > 0) {
    await saveServiceType(organizationId, { id, active: false });
    return { softDeleted: true };
  }

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('service_types')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw new Error(error.message);
    return { softDeleted: false };
  }

  const updatedTypes = store.serviceTypes.filter((st) => st.id !== id);
  saveLocalStore(store.customers, store.vehicles, updatedTypes, store.serviceRecords);
  return { softDeleted: false };
}

// ============================================================
// ETAPA 3: REGISTRO E HISTÓRICO DE SERVIÇOS (SERVICE RECORDS)
// ============================================================

export async function getServiceRecordsByVehicleId(
  vehicleId: string,
  organizationId: string
): Promise<ServiceRecordWithDetails[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*, service_type:service_types(*), customer:customers(*), vehicle:vehicles(*)')
        .eq('vehicle_id', vehicleId)
        .eq('organization_id', organizationId)
        .order('service_date', { ascending: false });

      if (!error && data) {
        return data.map((sr: any) => {
          const computed = computeReturnStatus(sr.next_return_date, sr.next_return_mileage, sr.vehicle?.mileage);
          return {
            ...sr,
            computed_status: computed.status,
            status_label: computed.label,
          };
        });
      }
    } catch (err) {
      console.error('Erro getServiceRecordsByVehicleId Supabase:', err);
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  const records = store.serviceRecords.filter(
    (sr) => sr.vehicle_id === vehicleId && sr.organization_id === organizationId
  );

  const vehicle = store.vehicles.find((v) => v.id === vehicleId);

  const results: ServiceRecordWithDetails[] = records.map((sr) => {
    const st = store.serviceTypes.find((t) => t.id === sr.service_type_id);
    const cust = store.customers.find((c) => c.id === sr.customer_id);
    const computed = computeReturnStatus(sr.next_return_date, sr.next_return_mileage, vehicle?.mileage);

    return {
      ...sr,
      service_type: st,
      customer: cust,
      vehicle,
      computed_status: computed.status,
      status_label: computed.label,
    };
  });

  results.sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());
  return results;
}

export async function getServiceRecordsByCustomerId(
  customerId: string,
  organizationId: string
): Promise<ServiceRecordWithDetails[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*, service_type:service_types(*), customer:customers(*), vehicle:vehicles(*)')
        .eq('customer_id', customerId)
        .eq('organization_id', organizationId)
        .order('service_date', { ascending: false });

      if (!error && data) {
        return data.map((sr: any) => {
          const computed = computeReturnStatus(sr.next_return_date, sr.next_return_mileage, sr.vehicle?.mileage);
          return {
            ...sr,
            computed_status: computed.status,
            status_label: computed.label,
          };
        });
      }
    } catch (err) {
      console.error('Erro getServiceRecordsByCustomerId Supabase:', err);
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  const records = store.serviceRecords.filter(
    (sr) => sr.customer_id === customerId && sr.organization_id === organizationId
  );

  const customer = store.customers.find((c) => c.id === customerId);

  const results: ServiceRecordWithDetails[] = records.map((sr) => {
    const st = store.serviceTypes.find((t) => t.id === sr.service_type_id);
    const veh = store.vehicles.find((v) => v.id === sr.vehicle_id);
    const computed = computeReturnStatus(sr.next_return_date, sr.next_return_mileage, veh?.mileage);

    return {
      ...sr,
      service_type: st,
      customer,
      vehicle: veh,
      computed_status: computed.status,
      status_label: computed.label,
    };
  });

  results.sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());
  return results;
}

export async function getServiceRecordById(
  id: string,
  organizationId: string
): Promise<ServiceRecordWithDetails | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*, service_type:service_types(*), customer:customers(*), vehicle:vehicles(*)')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

      if (!error && data) {
        const computed = computeReturnStatus(data.next_return_date, data.next_return_mileage, data.vehicle?.mileage);
        return {
          ...data,
          computed_status: computed.status,
          status_label: computed.label,
        };
      }
    } catch (err) {
      console.error('Erro getServiceRecordById Supabase:', err);
    }
  }

  const store = getLocalStore();
  const sr = store.serviceRecords.find((r) => r.id === id && r.organization_id === organizationId);
  if (!sr) return null;

  const st = store.serviceTypes.find((t) => t.id === sr.service_type_id);
  const cust = store.customers.find((c) => c.id === sr.customer_id);
  const veh = store.vehicles.find((v) => v.id === sr.vehicle_id);
  const computed = computeReturnStatus(sr.next_return_date, sr.next_return_mileage, veh?.mileage);

  return {
    ...sr,
    service_type: st,
    customer: cust,
    vehicle: veh,
    computed_status: computed.status,
    status_label: computed.label,
  };
}

export async function saveServiceRecord(
  organizationId: string,
  recordData: Partial<ServiceRecord>
): Promise<ServiceRecordWithDetails> {
  const isEditing = Boolean(recordData.id);

  if (!recordData.vehicle_id || !recordData.customer_id) {
    throw new Error('Veículo e cliente são obrigatórios para registrar o serviço.');
  }

  // Buscar informações do veículo
  const vehicle = await getVehicleById(recordData.vehicle_id, organizationId);
  if (!vehicle) throw new Error('Veículo não encontrado.');

  const inputMileage = Number(recordData.mileage || 0);

  // REQUISITO 14 & CENÁRIO B/C: Atualização da quilometragem do veículo
  // Se a quilometragem digitada for MAIOR que a do veículo, atualiza. Nunca reduz automaticamente.
  if (inputMileage > (vehicle.mileage || 0)) {
    await saveVehicle(organizationId, {
      ...vehicle,
      mileage: inputMileage,
    });
  }

  // Cálculo de retorno preventivo caso não fornecido explicitamente
  let nextDate = recordData.next_return_date;
  let nextKm = recordData.next_return_mileage;

  if (recordData.service_type_id && (!nextDate || nextKm === undefined)) {
    const st = await getServiceTypeById(recordData.service_type_id, organizationId);
    if (st) {
      const calc = calculateNextReturn(
        recordData.service_date || new Date().toISOString().split('T')[0],
        inputMileage,
        st.default_interval_months,
        st.default_interval_km
      );
      if (!nextDate) nextDate = calc.nextReturnDate;
      if (nextKm === undefined) nextKm = calc.nextReturnMileage;
    }
  }

  const computed = computeReturnStatus(nextDate, nextKm, Math.max(inputMileage, vehicle.mileage || 0));

  if (isSupabaseConfigured) {
    if (isEditing) {
      const { data, error } = await supabase
        .from('service_records')
        .update({
          customer_id: recordData.customer_id,
          vehicle_id: recordData.vehicle_id,
          service_type_id: recordData.service_type_id || null,
          service_date: recordData.service_date,
          mileage: inputMileage,
          price: recordData.price || 0,
          notes: recordData.notes,
          next_return_date: nextDate || null,
          next_return_mileage: nextKm || null,
          return_status: computed.status,
        })
        .eq('id', recordData.id)
        .eq('organization_id', organizationId)
        .select('*, service_type:service_types(*), customer:customers(*), vehicle:vehicles(*)')
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao atualizar atendimento.');
      return {
        ...data,
        computed_status: computed.status,
        status_label: computed.label,
      };
    } else {
      const { data, error } = await supabase
        .from('service_records')
        .insert({
          organization_id: organizationId,
          customer_id: recordData.customer_id,
          vehicle_id: recordData.vehicle_id,
          service_type_id: recordData.service_type_id || null,
          service_date: recordData.service_date || new Date().toISOString().split('T')[0],
          mileage: inputMileage,
          price: recordData.price || 0,
          notes: recordData.notes,
          next_return_date: nextDate || null,
          next_return_mileage: nextKm || null,
          return_status: computed.status,
        })
        .select('*, service_type:service_types(*), customer:customers(*), vehicle:vehicles(*)')
        .single();

      if (error || !data) throw new Error(error?.message || 'Erro ao salvar atendimento.');
      return {
        ...data,
        computed_status: computed.status,
        status_label: computed.label,
      };
    }
  }

  // Local Storage Fallback
  const store = getLocalStore();
  let updatedRecords = [...store.serviceRecords];
  const st = store.serviceTypes.find((t) => t.id === recordData.service_type_id);
  const cust = store.customers.find((c) => c.id === recordData.customer_id);

  if (isEditing) {
    const idx = updatedRecords.findIndex((r) => r.id === recordData.id && r.organization_id === organizationId);
    if (idx === -1) throw new Error('Atendimento não encontrado');

    const updated: ServiceRecord = {
      ...updatedRecords[idx],
      ...recordData,
      mileage: inputMileage,
      price: recordData.price || 0,
      next_return_date: nextDate,
      next_return_mileage: nextKm,
      return_status: computed.status,
      updated_at: new Date().toISOString(),
    };
    updatedRecords[idx] = updated;
    saveLocalStore(store.customers, store.vehicles, store.serviceTypes, updatedRecords);
    return {
      ...updated,
      service_type: st,
      customer: cust,
      vehicle,
      computed_status: computed.status,
      status_label: computed.label,
    };
  } else {
    const newRecord: ServiceRecord = {
      id: `sr-${Date.now()}`,
      organization_id: organizationId,
      customer_id: recordData.customer_id,
      vehicle_id: recordData.vehicle_id,
      service_type_id: recordData.service_type_id,
      service_date: recordData.service_date || new Date().toISOString().split('T')[0],
      mileage: inputMileage,
      price: recordData.price || 0,
      notes: recordData.notes,
      next_return_date: nextDate,
      next_return_mileage: nextKm,
      return_status: computed.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updatedRecords.unshift(newRecord);
    saveLocalStore(store.customers, store.vehicles, store.serviceTypes, updatedRecords);
    return {
      ...newRecord,
      service_type: st,
      customer: cust,
      vehicle,
      computed_status: computed.status,
      status_label: computed.label,
    };
  }
}

export async function deleteServiceRecord(id: string, organizationId: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('service_records')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw new Error(error.message);
    return;
  }

  const store = getLocalStore();
  const updatedRecords = store.serviceRecords.filter((r) => r.id !== id);
  saveLocalStore(store.customers, store.vehicles, store.serviceTypes, updatedRecords);
}

// ============================================================
// ETAPA 3: MÓDULO RETORNOS (REQUISITOS 20-27)
// ============================================================

export async function getReturnsList(
  organizationId: string,
  options: {
    statusFilter?: 'all' | 'today' | 'due_soon' | 'overdue' | 'scheduled';
    query?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PaginatedResult<ReturnCustomerItem>> {
  const { statusFilter = 'all', query = '', page = 1, pageSize = 25 } = options;

  const store = getLocalStore();
  const records = store.serviceRecords.filter(
    (sr) => sr.organization_id === organizationId && (sr.next_return_date || sr.next_return_mileage !== undefined)
  );

  let items: ReturnCustomerItem[] = [];

  for (const sr of records) {
    const cust = store.customers.find((c) => c.id === sr.customer_id);
    const veh = store.vehicles.find((v) => v.id === sr.vehicle_id);
    const st = store.serviceTypes.find((t) => t.id === sr.service_type_id);

    if (!cust || !veh) continue;

    const computed = computeReturnStatus(sr.next_return_date, sr.next_return_mileage, veh.mileage);

    items.push({
      id: sr.id,
      service_record: {
        ...sr,
        service_type: st,
        customer: cust,
        vehicle: veh,
        computed_status: computed.status,
        status_label: computed.label,
      },
      customer: cust,
      vehicle: veh,
      service_name: st?.name || 'Manutenção Preventiva',
      last_service_date: sr.service_date,
      last_service_mileage: sr.mileage,
      next_return_date: sr.next_return_date,
      next_return_mileage: sr.next_return_mileage,
      status: computed.status,
      status_label: computed.label,
      phone: cust.phone,
      whatsapp: cust.whatsapp,
    });
  }

  // Filtros de status
  if (statusFilter !== 'all') {
    if (statusFilter === 'today') items = items.filter((i) => i.status === 'due');
    else if (statusFilter === 'due_soon') items = items.filter((i) => i.status === 'due_soon');
    else if (statusFilter === 'overdue') items = items.filter((i) => i.status === 'overdue');
    else if (statusFilter === 'scheduled') items = items.filter((i) => i.status === 'scheduled');
  }

  // Busca por cliente, veículo, placa, serviço
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    items = items.filter(
      (i) =>
        i.customer.name.toLowerCase().includes(q) ||
        i.vehicle.brand.toLowerCase().includes(q) ||
        i.vehicle.model.toLowerCase().includes(q) ||
        i.vehicle.plate?.toLowerCase().includes(q) ||
        i.service_name.toLowerCase().includes(q)
    );
  }

  // Ordenar priorizando Atrasados -> Hoje -> Próximos -> Programados
  const statusPriority: Record<string, number> = {
    overdue: 1,
    due: 2,
    due_soon: 3,
    scheduled: 4,
  };

  items.sort((a, b) => {
    const pA = statusPriority[a.status] || 5;
    const pB = statusPriority[b.status] || 5;
    if (pA !== pB) return pA - pB;
    return new Date(a.next_return_date || 0).getTime() - new Date(b.next_return_date || 0).getTime();
  });

  const total = items.length;
  const from = (page - 1) * pageSize;
  const pageData = items.slice(from, from + pageSize);

  return {
    data: pageData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getReturnMetrics(organizationId: string) {
  const list = await getReturnsList(organizationId, { pageSize: 1000 });
  const items = list.data;

  const todayCount = items.filter((i) => i.status === 'due').length;
  const dueSoonCount = items.filter((i) => i.status === 'due_soon').length;
  const overdueCount = items.filter((i) => i.status === 'overdue').length;
  const totalScheduled = items.length;

  return {
    todayCount,
    dueSoonCount,
    overdueCount,
    totalScheduled,
  };
}

// ============================================================
// DASHBOARD - DADOS REAIS DA ETAPA 3 (REQUISITOS 28, 29, 30)
// ============================================================

export async function getDashboardMetrics(organizationId: string) {
  const activeCustomers = await getActiveCustomersCount(organizationId);
  const returnMetrics = await getReturnMetrics(organizationId);

  const store = getLocalStore();
  const records = store.serviceRecords.filter((r) => r.organization_id === organizationId);

  // Faturamento em Serviços (Somatório real dos serviços do mês atual ou total)
  const totalRevenue = records.reduce((acc, r) => acc + (Number(r.price) || 0), 0);

  // Retornos este mês
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const returnsThisMonth = records.filter((r) => {
    if (!r.next_return_date) return false;
    const d = new Date(r.next_return_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Clientes para contatar (Hoje + Atrasados)
  const customersToContactCount = returnMetrics.todayCount + returnMetrics.overdueCount;

  // Lista dos 5 retornos mais prioritários para o Dashboard
  const topReturnsList = await getReturnsList(organizationId, { pageSize: 5 });

  return {
    activeCustomers,
    returnsThisMonth,
    totalRevenue,
    customersToContactCount,
    topReturns: topReturnsList.data,
  };
}

// ============================================================
// MÉTRICAS DO CLIENTE E DO VEÍCULO (REQUISITOS 31, 32)
// ============================================================

export async function getCustomerMetrics(customerId: string, organizationId: string) {
  const records = await getServiceRecordsByCustomerId(customerId, organizationId);
  const totalServices = records.length;
  const totalSpent = records.reduce((acc, r) => acc + Number(r.price || 0), 0);

  let nextReturnDate: string | undefined = undefined;

  for (const r of records) {
    if (r.next_return_date) {
      if (!nextReturnDate || new Date(r.next_return_date) < new Date(nextReturnDate)) {
        nextReturnDate = r.next_return_date;
      }
    }
  }

  return {
    totalServices,
    totalSpent,
    nextReturnDate,
  };
}

export async function getVehicleMetrics(vehicleId: string, organizationId: string) {
  const records = await getServiceRecordsByVehicleId(vehicleId, organizationId);
  const totalServices = records.length;
  const totalSpent = records.reduce((acc, r) => acc + Number(r.price || 0), 0);
  const lastService = records[0] || null;

  let nextReturn: { date?: string; mileage?: number; statusLabel?: string } | null = null;
  if (lastService) {
    nextReturn = {
      date: lastService.next_return_date,
      mileage: lastService.next_return_mileage,
      statusLabel: lastService.status_label,
    };
  }

  return {
    totalServices,
    totalSpent,
    lastService,
    nextReturn,
  };
}

export async function getActiveCustomersCount(organizationId: string): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (!error && count !== null) return count;
    } catch (err) {
      console.error('Erro getActiveCustomersCount:', err);
    }
  }

  const store = getLocalStore();
  return store.customers.filter((c) => c.organization_id === organizationId && c.status === 'active').length;
}
