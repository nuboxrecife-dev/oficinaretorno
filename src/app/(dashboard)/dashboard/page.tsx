'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { MetricCard } from '@/components/ui/metric-card';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ReturnCustomerItem } from '@/types';
import { getActiveCustomersCount } from '@/services/data-service';
import {
  Users,
  RotateCcw,
  DollarSign,
  PhoneCall,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { profile, organization } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [contactModalItem, setContactModalItem] = useState<ReturnCustomerItem | null>(null);

  // Contagem real do banco para o card "Clientes ativos"
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);

  useEffect(() => {
    async function loadActiveCount() {
      if (organization?.id) {
        try {
          const count = await getActiveCustomersCount(organization.id);
          setActiveCustomersCount(count);
        } catch (err) {
          console.error('Erro ao carregar contagem de clientes ativos:', err);
        }
      }
    }
    loadActiveCount();
  }, [organization?.id]);

  // Dados fictícios de retornos mantidos como placeholder para módulos de Retorno (Etapa 4)
  const returnCustomers: ReturnCustomerItem[] = [
    {
      id: 'ret-1',
      clientName: 'João da Silva',
      vehicle: 'Toyota Corolla',
      service: 'Troca de óleo',
      nextReturnDate: '12/08/2026',
      status: 'hoje',
      statusLabel: 'Hoje',
      phone: '(81) 99999-9999',
    },
    {
      id: 'ret-2',
      clientName: 'Maria Oliveira',
      vehicle: 'Honda Civic',
      service: 'Revisão',
      nextReturnDate: '14/08/2026',
      status: 'em_3_dias',
      statusLabel: 'Em 3 dias',
      phone: '(81) 98765-4321',
    },
    {
      id: 'ret-3',
      clientName: 'Carlos Santos',
      vehicle: 'VW Golf',
      service: 'Freios',
      nextReturnDate: '15/08/2026',
      status: 'em_4_dias',
      statusLabel: 'Em 4 dias',
      phone: '(81) 97777-8888',
    },
    {
      id: 'ret-4',
      clientName: 'Ana Paula',
      vehicle: 'Fiat Argo',
      service: 'Ar-condicionado',
      nextReturnDate: '18/08/2026',
      status: 'em_7_dias',
      statusLabel: 'Em 7 dias',
      phone: '(81) 96666-5555',
    },
  ];

  const revenueChartData = [
    { month: 'Mar', receita: 14200 },
    { month: 'Abr', receita: 16800 },
    { month: 'Mai', receita: 19500 },
    { month: 'Jun', receita: 21000 },
    { month: 'Jul', receita: 22400 },
    { month: 'Ago', receita: 24850 },
  ];

  const funnelSteps = [
    { label: 'Clientes identificados', count: 120, pct: 100 },
    { label: 'Clientes contatados', count: 83, pct: 69.1 },
    { label: 'Agendamentos', count: 31, pct: 25.8 },
    { label: 'Retornos confirmados', count: 24, pct: 20.0 },
  ];

  const handleContactClick = (item: ReturnCustomerItem) => {
    setContactModalItem(item);
  };

  const scrollToTable = () => {
    const element = document.getElementById('secao-retornos');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header do Dashboard com Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Olá, {profile?.name || 'Gestor'} 👋
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Veja como sua oficina está recuperando clientes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={[
              { value: '30d', label: 'Últimos 30 dias' },
              { value: '60d', label: 'Últimos 60 dias' },
              { value: '90d', label: 'Últimos 90 dias' },
              { value: 'ano', label: 'Este ano' },
            ]}
            icon={<Filter className="w-4 h-4 text-slate-400" />}
            className="w-44 text-xs font-semibold h-10"
          />
        </div>
      </div>

      {/* 2. Grid com 4 Cards Principais (Clientes Ativos usa dado REAL do Banco) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Clientes ativos"
          value={String(activeCustomersCount)}
          indicator={activeCustomersCount > 0 ? '+100% real' : 'Sem clientes'}
          indicatorPositive={activeCustomersCount > 0}
          icon={<Users className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          title="Retornos este mês"
          value="67"
          indicator="+26%"
          indicatorPositive={true}
          icon={<RotateCcw className="w-5 h-5" />}
        />
        <MetricCard
          title="Faturamento recuperado"
          value="R$ 24.850"
          indicator="+31%"
          indicatorPositive={true}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Clientes para contatar"
          value="17"
          isPriority={true}
          ctaText="Ver retornos"
          onCtaClick={scrollToTable}
          icon={<PhoneCall className="w-5 h-5 text-brand-300" />}
        />
      </div>

      {/* 3. Área de Destaque / Action Banner Principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 text-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Prioridade Recomendada
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              17 clientes estão esperando seu contato.
            </h2>
            <p className="text-sm text-brand-100 font-normal leading-relaxed">
              Entre em contato com seus clientes no momento certo e aumente as chances de retorno.
            </p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={scrollToTable}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="bg-white text-brand-900 hover:bg-brand-50 shadow-md border-0 shrink-0 font-bold"
          >
            Ver clientes para retornar
          </Button>
        </div>
      </div>

      {/* 4. Tabela "Clientes que precisam retornar" */}
      <div id="secao-retornos" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Clientes que precisam retornar</h2>
            <p className="text-xs text-slate-500">
              Lista prioritária de atendimentos com vencimento de revisão ou manutenção nesta semana.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
            {returnCustomers.length} retornos próximos
          </span>
        </div>

        <DataTable data={returnCustomers} onActionClick={handleContactClick} />
      </div>

      {/* 5. Funil + Gráfico de Receita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recuperação de clientes</h3>
              <p className="text-xs text-slate-500">Conversão por etapa do processo de retorno</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Taxa Geral</span>
              <span className="text-lg font-extrabold text-emerald-600">28,9%</span>
            </div>
          </div>

          <div className="space-y-3.5 my-auto">
            {funnelSteps.map((step) => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 font-semibold">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{step.count}</span>
                    <span className="text-[11px] text-slate-400">({step.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-brand-600 to-brand-500"
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Retornos confirmados em alta
            </span>
            <span className="font-semibold text-slate-700">Meta mensal: 30 retornos</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Receita recuperada</h3>
              <p className="text-xs text-slate-500">Evolução do faturamento nos últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
              <TrendingUp className="w-3.5 h-3.5" />
              +75% no semestre
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `R$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                  labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area type="monotone" dataKey="receita" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Média mensal recuperada:</span>
            <span className="font-bold text-slate-900">R$ 19.791,00 / mês</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(contactModalItem)}
        onClose={() => setContactModalItem(null)}
        title="Iniciar Contato de Retorno"
        footer={
          <Button onClick={() => setContactModalItem(null)} variant="primary">
            Entendido
          </Button>
        }
      >
        {contactModalItem && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <p className="text-xs text-slate-500 font-semibold uppercase">Cliente Selecionado</p>
              <h4 className="text-base font-bold text-slate-900">{contactModalItem.clientName}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Veículo</span>
                  <span className="font-semibold text-slate-800">{contactModalItem.vehicle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Serviço Anterior</span>
                  <span className="font-semibold text-slate-800">{contactModalItem.service}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Integração WhatsApp (Etapa 4)
              </div>
              <p className="text-xs leading-relaxed text-emerald-800">
                Na Etapa 2, os módulos operacionais de Clientes e Veículos já contam dados reais do seu banco. A integração com disparo de mensagens WhatsApp será ativada na Etapa 4.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
