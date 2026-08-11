import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Customer, Vehicle, CustomerWithVehicles, VehicleWithCustomer, PaginatedResult } from '@/types';

const LOCAL_CUSTOMERS_KEY = 'oficina_retorno_customers';
const LOCAL_VEHICLES_KEY = 'oficina_retorno_vehicles';

// Seed de dados iniciais para testes imediatos sem Supabase
function getInitialSeedData() {
  const orgId = 'org-demo-123';
  
  const initialCustomers: Customer[] = [
    {
      id: 'cust-1',
      organization_id: orgId,
      name: 'João da Silva',
      phone: '(81) 3456-7890',
      whatsapp: '(81) 99999-9999',
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
      whatsapp: '(81) 98765-4321',
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
      whatsapp: '(81) 97777-8888',
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
      whatsapp: '(81) 96666-5555',
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
      mileage: 87500,
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

  return { initialCustomers, initialVehicles };
}

// Helpers para LocalStorage Store
function getLocalStore() {
  if (typeof window === 'undefined') return { customers: [], vehicles: [] };

  let custStr = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
  let vehStr = localStorage.getItem(LOCAL_VEHICLES_KEY);

  if (!custStr || !vehStr) {
    const { initialCustomers, initialVehicles } = getInitialSeedData();
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(initialCustomers));
    localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(initialVehicles));
    return { customers: initialCustomers, vehicles: initialVehicles };
  }

  return {
    customers: JSON.parse(custStr) as Customer[],
    vehicles: JSON.parse(vehStr) as Vehicle[],
  };
}

function saveLocalStore(customers: Customer[], vehicles: Vehicle[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(customers));
  localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(vehicles));
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

      // Multitenancy extra guard
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

  // Ordenação
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
    saveLocalStore(updatedCustomers, store.vehicles);
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
    saveLocalStore(updatedCustomers, store.vehicles);
    return newCustomer;
  }
}

export async function deleteCustomer(customerId: string, organizationId: string): Promise<void> {
  // Regra 24: Verificar se cliente possui veículos antes de excluir
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
  saveLocalStore(updatedCustomers, store.vehicles);
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
    saveLocalStore(store.customers, updatedVehicles);
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
    saveLocalStore(store.customers, updatedVehicles);
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
  saveLocalStore(store.customers, updatedVehicles);
}

// ============================================================
// CONTAGEM DE CLIENTES ATIVOS PARA O DASHBOARD
// ============================================================

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
