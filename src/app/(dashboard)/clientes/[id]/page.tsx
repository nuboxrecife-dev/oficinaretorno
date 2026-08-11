'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/ui/page-header';
import { Button, PrimaryButton } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { CustomerModal } from '@/components/customers/customer-modal';
import { VehicleModal } from '@/components/vehicles/vehicle-modal';
import { ServiceRecordModal } from '@/components/service-records/service-record-modal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { CustomerWithVehicles, Vehicle, ServiceRecordWithDetails } from '@/types';
import {
  getCustomerById,
  saveCustomer,
  saveVehicle,
  deleteVehicle,
  getCustomerMetrics,
  getServiceRecordsByCustomerId,
} from '@/services/data-service';
import { formatPhone, formatDate, formatCpfCnpj, formatMileage, formatPlate, formatCurrency } from '@/lib/formatters';
import {
  User,
  MessageSquare,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Car,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
  Wrench,
  RotateCcw,
  DollarSign,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentOrganization } = useAuth();
  const orgId = currentOrganization?.id || 'org-demo-123';
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerWithVehicles | null>(null);

  // Etapa 3: Métricas e Serviços do Cliente (Req 31, 36, 40)
  const [customerMetrics, setCustomerMetrics] = useState({
    totalServices: 0,
    totalSpent: 0,
    nextReturnDate: undefined as string | undefined,
  });
  const [customerRecords, setCustomerRecords] = useState<ServiceRecordWithDetails[]>([]);

  // Modais
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Exclusão de veículo
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  const fetchCustomerDetails = useCallback(async () => {
    if (!orgId || !customerId) return;
    setLoading(true);
    try {
      const [cData, metricsData, recordsData] = await Promise.all([
        getCustomerById(customerId, orgId),
        getCustomerMetrics(customerId, orgId),
        getServiceRecordsByCustomerId(customerId, orgId),
      ]);

      setCustomer(cData);
      setCustomerMetrics(metricsData);
      setCustomerRecords(recordsData);
    } catch (err) {
      console.error('Erro ao carregar detalhes do cliente:', err);
    } finally {
      setLoading(false);
    }
  }, [orgId, customerId]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleSaveCustomer = async (data: any) => {
    if (!orgId) return;
    await saveCustomer(orgId, data);
    fetchCustomerDetails();
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleEditVehicle = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (data: any) => {
    if (!orgId) return;
    await saveVehicle(orgId, data);
    fetchCustomerDetails();
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!deletingVehicle || !orgId) return;
    setIsDeletingVehicle(true);
    try {
      await deleteVehicle(deletingVehicle.id, orgId);
      setDeletingVehicle(null);
      fetchCustomerDetails();
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
    } finally {
      setIsDeletingVehicle(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 my-6">
        <LoadingState label="Buscando informações do cliente..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Clientes
        </Link>
        <EmptyState
          title="Cliente não encontrado"
          description="O cliente solicitado não existe ou pertence a outra organização."
          icon={<User className="w-10 h-10 text-slate-400" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Voltar & Header de Detalhes */}
      <div className="space-y-4">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para lista de clientes
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm">
              {customer.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">{customer.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    customer.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-1">
                {customer.whatsapp && (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    {formatPhone(customer.whatsapp)}
                  </span>
                )}
                {customer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {formatPhone(customer.phone)}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {customer.email}
                  </span>
                )}
                {customer.cpf_cnpj && (
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    {formatCpfCnpj(customer.cpf_cnpj)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button variant="outline" onClick={() => setIsCustomerModalOpen(true)}>
              <Edit2 className="w-4 h-4 mr-1.5" />
              Editar cliente
            </Button>

            {/* Atalho para registrar serviço (Req 40) */}
            <Button onClick={() => setIsRecordModalOpen(true)} className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Registrar serviço</span>
            </Button>

            <Button variant="outline" onClick={handleAddVehicle} className="flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              <span>Adicionar veículo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Cards Resumo do Cliente Com Dados Reais (Req 31) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Veículos</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold text-slate-100">{customer.vehicles_count}</h3>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Serviços realizados</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold text-slate-100">{customerMetrics.totalServices}</h3>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Próximo retorno</p>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-amber-400">
              {customerMetrics.nextReturnDate ? formatDate(customerMetrics.nextReturnDate) : 'Nenhum'}
            </h3>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Receita gerada</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(customerMetrics.totalSpent)}
            </h3>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Observações adicionais */}
      {customer.notes && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" /> Observações do cliente
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{customer.notes}</p>
        </div>
      )}

      {/* 3. Seção de Veículos do Cliente */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Veículos do cliente</h2>
            <p className="text-xs text-slate-400">
              Frota cadastrada pertencente a {customer.name}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddVehicle} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar veículo</span>
          </Button>
        </div>

        {customer.vehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo cadastrado"
            description="Os veículos cadastrados para este cliente aparecerão aqui."
            actionText="Adicionar veículo"
            onAction={handleAddVehicle}
            icon={<Car className="w-10 h-10 text-amber-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-base">
                        {v.brand} {v.model}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">{v.year ? `Ano ${v.year}` : 'Ano não informado'}</p>
                    </div>

                    {v.plate && (
                      <span className="px-2.5 py-1 bg-slate-950 text-amber-400 border border-slate-800 font-mono font-bold text-xs rounded-lg uppercase tracking-wider">
                        {formatPlate(v.plate)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Quilometragem</span>
                      <span className="font-bold text-amber-400">{formatMileage(v.mileage)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Combustível</span>
                      <span className="font-medium text-slate-300">{v.fuel_type || 'N/I'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link href={`/veiculos/${v.id}`}>
                    <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Ver veículo
                    </Button>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEditVehicle(v)} title="Editar">
                      <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeletingVehicle(v)} title="Excluir">
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Histórico dos Últimos Serviços do Cliente (Req 36) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Últimos Serviços</h2>
        {customerRecords.length === 0 ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            Nenhum serviço registrado para os veículos deste cliente até o momento.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Veículo</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Quilometragem</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Próximo Retorno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {r.vehicle?.brand} {r.vehicle?.model} {r.vehicle?.plate ? `[${r.vehicle.plate}]` : ''}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {r.service_type?.name || 'Manutenção Preventiva'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(r.service_date)}</td>
                    <td className="px-4 py-3 text-slate-400">{r.mileage?.toLocaleString('pt-BR')} km</td>
                    <td className="px-4 py-3 font-semibold text-amber-400">{formatCurrency(r.price || 0)}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {r.next_return_date ? formatDate(r.next_return_date) : '—'}
                      {r.next_return_mileage ? ` (${r.next_return_mileage.toLocaleString('pt-BR')} km)` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro de Serviço (Req 40) */}
      <ServiceRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => fetchCustomerDetails()}
        organizationId={orgId}
        presetCustomerId={customer.id}
      />

      {/* Modal de Editar Cliente */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={customer}
      />

      {/* Modal de Adicionar / Editar Veículo */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={editingVehicle}
        customerId={customer.id}
      />

      {/* Modal de Exclusão de Veículo */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingVehicle)}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleConfirmDeleteVehicle}
        title="Excluir veículo?"
        description={`Tem certeza que deseja excluir o veículo ${deletingVehicle?.brand} ${deletingVehicle?.model}?`}
        loading={isDeletingVehicle}
      />
    </div>
  );
}
