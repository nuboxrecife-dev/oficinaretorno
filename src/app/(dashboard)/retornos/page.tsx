'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/returns/contact-modal';
import { ReturnCustomerItem } from '@/types';
import { getReturnsList, getReturnMetrics } from '@/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { formatDate } from '@/lib/formatters';
import {
  RotateCcw,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  MessageSquare,
  Car,
  User,
  Filter,
} from 'lucide-react';

export default function RetornosPage() {
  const { currentOrganization } = useAuth();
  const orgId = currentOrganization?.id || 'org-demo-123';

  const [returns, setReturns] = useState<ReturnCustomerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'due_soon' | 'overdue' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [metrics, setMetrics] = useState({
    todayCount: 0,
    dueSoonCount: 0,
    overdueCount: 0,
    totalScheduled: 0,
  });

  const [contactTarget, setContactTarget] = useState<ReturnCustomerItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, metricsRes] = await Promise.all([
        getReturnsList(orgId, {
          statusFilter,
          query: searchQuery,
          pageSize: 100,
        }),
        getReturnMetrics(orgId),
      ]);

      setReturns(listRes.data);
      setMetrics(metricsRes);
    } catch (err) {
      console.error('Erro ao carregar retornos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId, statusFilter, searchQuery]);

  // Função para renderizar badge do status do retorno (Req 22-24)
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
            <Calendar className="w-3.5 h-3.5" />
            <span>Próximos 30 dias</span>
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <PageHeader
        title="Retornos"
        subtitle="Veja quais clientes precisam retornar à sua oficina com base nas datas e quilometragens recomendadas."
      />

      {/* Cards de Métricas Reais (Req 26) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Para contatar hoje"
          value={metrics.todayCount}
          description="Retornos previstos para a data atual"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Próximos 30 dias"
          value={metrics.dueSoonCount}
          description="Retornos preventivos no próximo mês"
          icon={<Calendar className="w-5 h-5 text-blue-400" />}
        />
        <MetricCard
          title="Atrasados"
          value={metrics.overdueCount}
          description="Retornos que ultrapassaram a data ou KM"
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
        />
        <MetricCard
          title="Total programado"
          value={metrics.totalScheduled}
          description="Histórico com agendamento ativo"
          icon={<RotateCcw className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Filtros de Status & Busca (Req 25) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            Todos ({metrics.totalScheduled})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'today' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('today')}
            className={statusFilter === 'today' ? '' : 'hover:border-amber-500/40 text-amber-400'}
          >
            Hoje ({metrics.todayCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'due_soon' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('due_soon')}
          >
            Próximos ({metrics.dueSoonCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'overdue' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('overdue')}
            className={statusFilter === 'overdue' ? '' : 'hover:border-red-500/40 text-red-400'}
          >
            Atrasados ({metrics.overdueCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'scheduled' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('scheduled')}
          >
            Programados
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            className="pl-9"
            placeholder="Buscar cliente, veículo, placa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Retornos */}
      {loading ? (
        <LoadingState message="Carregando fila de retornos..." />
      ) : returns.length === 0 ? (
        <EmptyState
          icon={<RotateCcw className="w-10 h-10" />}
          title="Nenhum retorno pendente"
          description="Quando um serviço possuir uma próxima manutenção programada, ele aparecerá nesta fila."
        />
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Cliente</th>
                  <th className="px-4 py-3.5">Veículo</th>
                  <th className="px-4 py-3.5">Serviço Realizado</th>
                  <th className="px-4 py-3.5">Último Atendimento</th>
                  <th className="px-4 py-3.5">Próximo Retorno</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {returns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.customer.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 ml-5">
                        {item.customer.whatsapp || item.customer.phone || 'Sem telefone'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-200 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {item.vehicle.brand} {item.vehicle.model}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 ml-5">
                        Placa: {item.vehicle.plate || 'N/I'} • {item.vehicle.mileage?.toLocaleString('pt-BR')} km atuais
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-300">
                      {item.service_name}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      <div>{formatDate(item.last_service_date)}</div>
                      <div className="text-xs text-slate-400">{item.last_service_mileage?.toLocaleString('pt-BR')} km</div>
                    </td>

                    <td className="px-4 py-3.5">
                      {item.next_return_date && (
                        <div className="font-medium text-amber-400">
                          Data: {formatDate(item.next_return_date)}
                        </div>
                      )}
                      {item.next_return_mileage && (
                        <div className="text-xs text-slate-300">
                          KM: {item.next_return_mileage.toLocaleString('pt-BR')} km
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">{renderStatusBadge(item)}</td>

                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        onClick={() => setContactTarget(item)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 ml-auto"
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

      {/* Modal de Contato com o Cliente */}
      <ContactModal
        isOpen={Boolean(contactTarget)}
        onClose={() => setContactTarget(null)}
        item={contactTarget}
      />
    </div>
  );
}
