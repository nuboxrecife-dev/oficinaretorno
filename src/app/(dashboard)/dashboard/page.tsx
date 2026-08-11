'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MetricCard } from '@/components/ui/metric-card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/returns/contact-modal';
import { ReturnCustomerItem } from '@/types';
import { getDashboardMetrics } from '@/services/data-service';
import { formatCurrency, formatDate } from '@/lib/formatters';
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
  Wrench,
  Clock,
  AlertTriangle,
  Car,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { profile, currentOrganization } = useAuth();
  const orgId = currentOrganization?.id || 'org-demo-123';

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [contactModalItem, setContactModalItem] = useState<ReturnCustomerItem | null>(null);

  // Dados reais do Dashboard (Etapa 3 - Req 28, 29, 30)
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeCustomers: 0,
    returnsThisMonth: 0,
    totalRevenue: 0,
    customersToContactCount: 0,
    topReturns: [] as ReturnCustomerItem[],
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardMetrics(orgId);
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar métricas do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [orgId]);

  const handleContactClick = (item: ReturnCustomerItem) => {
    setContactModalItem(item);
  };

  const renderStatusBadge = (item: ReturnCustomerItem) => {
    switch (item.status) {
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Atrasado</span>
          </span>
        );
      case 'due':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{item.status_label || 'Hoje'}</span>
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Próximo (30 dias)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Programado</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Olá, {profile?.name || 'Gestor'} 👋
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-1">
            Veja o desempenho da sua oficina e a previsão dos retornos preventivos.
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

      {/* 2. Grid com 4 Cards Principais com DADOS REAIS da Etapa 3 (Req 28, 29) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Clientes ativos"
          value={String(metrics.activeCustomers)}
          description="Cadastrados no sistema"
          icon={<Users className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Retornos este mês"
          value={String(metrics.returnsThisMonth)}
          description="Agendamentos previstos"
          icon={<RotateCcw className="w-5 h-5 text-blue-400" />}
        />
        <MetricCard
          title="Faturamento em serviços"
          value={formatCurrency(metrics.totalRevenue)}
          description="Soma de atendimentos"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Clientes para contatar"
          value={String(metrics.customersToContactCount)}
          description="Atrasados ou para hoje"
          icon={<PhoneCall className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* 3. Área de Destaque / Action Banner Principal (Req 29) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Ação Preventiva Recomendada
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {metrics.customersToContactCount > 0
                ? `${metrics.customersToContactCount} cliente(s) precisam da sua atenção hoje.`
                : 'Sua fila de retornos preventivos está em dia!'}
            </h2>
            <p className="text-sm text-amber-100 font-normal leading-relaxed">
              Fale com seus clientes no momento ideal e garanta que eles tragam o veículo de volta à sua oficina.
            </p>
          </div>
          <Link href="/retornos">
            <Button
              size="lg"
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/40 shadow-md font-bold shrink-0 flex items-center gap-2"
            >
              <span>Ver retornos</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4. Tabela Real "Clientes que precisam retornar" (Req 30) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Clientes que precisam retornar</h2>
            <p className="text-xs text-slate-400">
              Lista prioritária de clientes com retornos pendentes ou em atraso.
            </p>
          </div>
          <Link href="/retornos">
            <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300">
              Ver todos os retornos <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {metrics.topReturns.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            Nenhum retorno pendente no momento. Registre serviços em seus veículos para ativar a fila.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Veículo</th>
                    <th className="px-4 py-3">Serviço Realizado</th>
                    <th className="px-4 py-3">Próximo Retorno</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.topReturns.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {item.vehicle.brand} {item.vehicle.model}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{item.service_name}</td>
                      <td className="px-4 py-3.5 font-medium text-amber-400">
                        {item.next_return_date ? formatDate(item.next_return_date) : '—'}
                        {item.next_return_mileage ? ` (${item.next_return_mileage.toLocaleString('pt-BR')} km)` : ''}
                      </td>
                      <td className="px-4 py-3.5">{renderStatusBadge(item)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleContactClick(item)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 ml-auto text-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Contatar</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Contato com o Cliente */}
      <ContactModal
        isOpen={Boolean(contactModalItem)}
        onClose={() => setContactModalItem(null)}
        item={contactModalItem}
      />
    </div>
  );
}
