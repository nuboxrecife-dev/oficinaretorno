'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MetricCard } from '@/components/ui/metric-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { ServiceTypeModal } from '@/components/services/service-type-modal';
import { ServiceType } from '@/types';
import { getServiceTypes, deleteServiceType, saveServiceType } from '@/services/data-service';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/formatters';
import { Wrench, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Clock, Gauge } from 'lucide-react';

export default function ServicosPage() {
  const { currentOrganization } = useAuth();
  const orgId = currentOrganization?.id || 'org-demo-123';

  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceType | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ServiceType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getServiceTypes(orgId, { query: searchQuery });
      setServices(data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId, searchQuery]);

  const handleOpenCreate = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: ServiceType) => {
    setServiceToEdit(st);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (st: ServiceType) => {
    try {
      await saveServiceType(orgId, { ...st, active: !st.active });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteServiceType(deleteTarget.id, orgId);
      if (res.softDeleted) {
        setNotification(`O serviço "${deleteTarget.name}" possui atendimentos no histórico e foi desativado.`);
      } else {
        setNotification(`Serviço "${deleteTarget.name}" removido com sucesso.`);
      }
      setTimeout(() => setNotification(null), 4000);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir serviço.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Métricas
  const totalServices = services.length;
  const activeCount = services.filter((s) => s.active).length;
  const avgPrice =
    totalServices > 0
      ? services.reduce((acc, s) => acc + (s.default_price || 0), 0) / totalServices
      : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <PageHeader
        title="Catálogo de Serviços"
        subtitle="Configure os serviços realizados pela sua oficina e os intervalos recomendados de retorno."
        action={
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>+ Novo serviço</span>
          </Button>
        }
      />

      {/* Notificação Toast */}
      {notification && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-xl flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white text-xs">
            Fechar
          </button>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total de Serviços"
          value={totalServices}
          description={`${activeCount} ativos no catálogo`}
          icon={<Wrench className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Preço Médio de Tabela"
          value={formatCurrency(avgPrice)}
          description="Média do catálogo configurado"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Com Retorno por KM / Tempo"
          value={services.filter((s) => s.default_interval_months || s.default_interval_km).length}
          description="Serviços com retorno preventivo"
          icon={<Gauge className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome do serviço ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conteúdo da Tabela */}
      {loading ? (
        <LoadingState message="Carregando catálogo de serviços..." />
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-10 h-10" />}
          title="Nenhum serviço configurado"
          description="Cadastre os serviços oferecidos pela sua oficina para começar a registrar manutenções."
          action={
            <Button onClick={handleOpenCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Cadastrar serviço</span>
            </Button>
          }
        />
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Serviço</th>
                  <th className="px-4 py-3.5">Intervalo por Tempo</th>
                  <th className="px-4 py-3.5">Intervalo por KM</th>
                  <th className="px-4 py-3.5">Preço Padrão</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {services.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-100">{st.name}</div>
                      {st.description && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{st.description}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {st.default_interval_months ? `${st.default_interval_months} meses` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {st.default_interval_km ? `${st.default_interval_km.toLocaleString('pt-BR')} km` : '—'}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-amber-400">
                      {formatCurrency(st.default_price || 0)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(st)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          st.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {st.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{st.active ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(st)}
                          title="Editar Serviço"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(st)}
                          title="Excluir Serviço"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Formulário */}
      <ServiceTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadData()}
        organizationId={orgId}
        serviceTypeToEdit={serviceToEdit}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Serviço do Catálogo?"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Caso o serviço já possua histórico associado a veículos, ele será apenas desativado.`}
        loading={isDeleting}
      />
    </div>
  );
}
