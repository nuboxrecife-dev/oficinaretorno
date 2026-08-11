-- ==========================================
-- OFICINA RETORNO - SCHEMA DE BANCO DE DADOS
-- ETAPA 1 & 2: Estrutura Base Multi-tenant, Auth, Clientes e Veículos
-- ==========================================

-- Habilitar extensão UUID caso não esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE ORGANIZAÇÕES (OFICINAS)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- 2. TABELA DE PERFIS DE USUÁRIOS (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

-- 3. TABELA DE CLIENTES (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    cpf_cnpj VARCHAR(30),
    birth_date DATE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON public.customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_search ON public.customers(organization_id, name, whatsapp, cpf_cnpj);

-- 4. TABELA DE VEÍCULOS (VEHICLES)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    plate VARCHAR(20),
    color VARCHAR(50),
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    fuel_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON public.vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(organization_id, plate);

-- 5. FUNÇÃO AUXILIAR RLS PARA OBTER ORGANIZATION_ID DO USUÁRIO CONECTADO
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. ROW LEVEL SECURITY (RLS) - SEGURANÇA MULTIEMPRESA

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Políticas para Organizations:
CREATE POLICY "Permitir leitura da propria organizacao"
    ON public.organizations FOR SELECT
    USING (id = public.get_user_organization_id());

CREATE POLICY "Permitir atualizacao da propria organizacao por donos/admins"
    ON public.organizations FOR UPDATE
    USING (id = public.get_user_organization_id());

CREATE POLICY "Permitir criacao de organizacao no cadastro"
    ON public.organizations FOR INSERT
    WITH CHECK (true);

-- Políticas para Profiles:
CREATE POLICY "Permitir leitura de perfis da mesma organizacao"
    ON public.profiles FOR SELECT
    USING (organization_id = public.get_user_organization_id() OR id = auth.uid());

CREATE POLICY "Permitir atualizacao do proprio perfil"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Permitir criacao de perfil no cadastro"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Políticas para Customers:
CREATE POLICY "Permitir leitura de clientes da mesma organizacao"
    ON public.customers FOR SELECT
    USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Permitir criacao de cliente na mesma organizacao"
    ON public.customers FOR INSERT
    WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Permitir atualizacao de cliente da mesma organizacao"
    ON public.customers FOR UPDATE
    USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Permitir exclusao de cliente da mesma organizacao"
    ON public.customers FOR DELETE
    USING (organization_id = public.get_user_organization_id());

-- Políticas para Vehicles:
CREATE POLICY "Permitir leitura de veiculos da mesma organizacao"
    ON public.vehicles FOR SELECT
    USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Permitir criacao de veiculo na mesma organizacao"
    ON public.vehicles FOR INSERT
    WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Permitir atualizacao de veiculo da mesma organizacao"
    ON public.vehicles FOR UPDATE
    USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Permitir exclusao de veiculo da mesma organizacao"
    ON public.vehicles FOR DELETE
    USING (organization_id = public.get_user_organization_id());

-- Triggers para atualização automatizada do campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
