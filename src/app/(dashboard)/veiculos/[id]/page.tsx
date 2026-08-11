'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button, PrimaryButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { MetricCard } from '@/components/ui/metric-card';
import { VehicleModal } from '@/components/vehicles/vehicle-modal';
import { ServiceRecordModal } from '@/components/service-records/service-record-modal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { VehicleWithCustomer, Customer, ServiceRecordWithDetails } from '@/types';
import {
  getVehicleById,
  saveVehicle,
  deleteVehicle,
  getCustomers,
  getServiceRecordsByVehicleId,
  getVehicleMetrics,
  deleteServiceRecord,
} from '@/services/data-service';
import { formatPlate, formatMileage, formatPhone, formatDate, formatCurrency } from '@/lib/formatters';
import {
  Car,
  User,
  MessageSquare,
  ArrowLeft,
  Edit2,
  Trash2,
  Gauge,
  Fuel,
  Palette,
  Calendar,
  Wrench,
  Clock,
  Sparkles,
  Plus,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentOrganization } = useAuth();
  const orgId = currentOrganization?.id || 'org-demo-123';
  const vehicleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<VehicleWithCustomer | null>(null);
  const [customersList, setCustomersList] = useState<Customer[]>([]);

  // Serviços e Métricas (Etapa 3)
  const [serviceRecords, setServiceRecords] = useState<ServiceRecordWithDetails[]>([]);
  const [vehicleMetrics, setVehicleMetrics] = useState({
    totalServices: 0,
    totalSpent: 0,
    lastService: null as ServiceRecordWithDetails | null,
    nextReturn: null as any,
  });

  // Modais
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<boolean>(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<ServiceRecordWithDetails | null>(null);

  const [recordToDelete, setRecordToDelete] = useState<ServiceRecordWithDetails | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);

  const fetchVehicleDetails = useCallback(async () => {
    if (!orgId || !vehicleId) return;
    setLoading(true);
    try {
      const [vData, custResult, recordsData, metricsData] = await Promise.all([
        getVehicleById(vehicleId, orgId),
        getCustomers(orgId, { pageSize: 100 }),
        getServiceRecordsByVehicleId(vehicleId, orgId),
        getVehicleMetrics(vehicleId, orgId),
      ]);

      setVehicle(vData);
      setCustomersList(custResult.data);
      setServiceRecords(recordsData);
      setVehicleMetrics(metricsData as any);
    } catch (err) {
      console.error('Erro ao buscar detalhes do veículo:', err);
    } finally {
      setLoading(false);
    }
  }, [orgId, vehicleId]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  const handleSaveVehicle = async (data: any) => {
    if (!orgId) return;
    await saveVehicle(orgId, data);
    fetchVehicleDetails();
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!vehicle || !orgId) return;
    setIsDeletingVehicle(true);
    try {
      await deleteVehicle(vehicle.id, orgId);
      router.push('/veiculos');
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      setIsDeletingVehicle(false);
    }
  };

  const handleOpenNewService = () => {
    setRecordToEdit(null);
    setIsRecordModalOpen(true);
  };

  const handleEditRecord = (record: ServiceRecordWithDetails) => {
    setRecordToEdit(record);
    setIsRecordModalOpen(true);
  };

  const handleConfirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    setIsDeletingRecord(true);
    try {
      await deleteServiceRecord(recordToDelete.id, orgId);
      setRecordToDelete(null);
      fetchVehicleDetails();
    } catch (err) {
      console.error('Erro ao excluir atendimento:', err);
    } finally {
      setIsDeletingRecord(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 my-6">
        <LoadingState message="Buscando informações do veículo e histórico de serviços..." />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <Link
          href="/veiculos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Veículos
        </Link>
        <EmptyState
          title="Veículo não encontrado"
          description="O veículo solicitado não existe ou pertence a outra organização."
          icon={<Car className="w-10 h-10 text-slate-400" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Voltar & Header do Veículo */}
      <div className="space-y-4">
        <Link
          href="/veiculos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para lista de veículos
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
              <Car className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.plate && (
                  <span className="px-3 py-1 bg-slate-950 text-amber-400 border border-slate-800 font-mono font-bold text-sm rounded-lg uppercase tracking-wider">
                    {formatPlate(vehicle.plate)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Ano: {vehicle.year || 'Não informado'}
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Gauge className="w-3.5 h-3.5" />
                  {formatMileage(vehicle.mileage)}
                </span>
                <span className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-slate-500" />
                  {vehicle.fuel_type || 'Combustível N/I'}
                </span>
                {vehicle.color && (
                  <span className="flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-slate-500" />
                    {vehicle.color}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar veículo</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeletingVehicle(true)}
              className="text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Resumo de Métricas do Veículo (Req 32) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Serviços Realizados"
          value={vehicleMetrics.totalServices}
          description="Atendimentos registrados"
          icon={<Wrench className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Total Gasto no Veículo"
          value={formatCurrency(vehicleMetrics.totalSpent)}
          description="Soma de todos os serviços"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Último Serviço"
          value={vehicleMetrics.lastService ? formatDate(vehicleMetrics.lastService.service_date) : 'Nenhum'}
          description={vehicleMetrics.lastService?.service_type?.name || 'Aguardando serviço'}
          icon={<Clock className="w-5 h-5 text-blue-400" />}
        />
        <MetricCard
          title="Próximo Retorno"
          value={
            vehicleMetrics.nextReturn?.date
              ? formatDate(vehicleMetrics.nextReturn.date)
              : vehicleMetrics.nextReturn?.mileage
              ? `${vehicleMetrics.nextReturn.mileage.toLocaleString('pt-BR')} km`
              : 'Nenhum'
          }
          description={vehicleMetrics.nextReturn?.statusLabel || 'Sem agendamento'}
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* 3. Card do Proprietário (Cliente) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" /> Proprietário do Veículo
          </h3>
          {vehicle.customer && (
            <Link href={`/clientes/${vehicle.customer.id}`}>
              <Button size="sm" variant="outline" className="font-bold">
                Ver cliente
              </Button>
            </Link>
          )}
        </div>

        {vehicle.customer ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                {vehicle.customer.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-100 text-sm">{vehicle.customer.name}</h4>
                {vehicle.customer.whatsapp && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    {formatPhone(vehicle.customer.whatsapp)}
                  </p>
                )}
              </div>
            </div>

            <Link href={`/clientes/${vehicle.customer.id}`}>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Acessar Ficha do Cliente
              </Button>
            </Link>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Nenhum proprietário associado a este veículo.</p>
        )}
      </div>

      {/* 4. Histórico de Serviços (Req 9, 15, 16, 17, 18, 19) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Histórico de Serviços</h2>
            <p className="text-xs text-slate-400">
              Registros das manutenções executadas neste veículo e previsões de retorno.
            </p>
          </div>
          <Button onClick={handleOpenNewService} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>+ Registrar serviço</span>
          </Button>
        </div>

        {serviceRecords.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Wrench className="w-7 h-7 text-amber-400" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-100">Nenhum serviço registrado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Registre a primeira manutenção realizada neste veículo para calcular automaticamente a data e a quilometragem do próximo retorno preventivo.
              </p>
            </div>
            <Button onClick={handleOpenNewService} className="flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              <span>Registrar serviço</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {serviceRecords.map((record) => (
              <div
                key={record.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        {record.service_type?.name || 'Manutenção Preventiva'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Realizado em: {formatDate(record.service_date)} • KM no atendimento:{' '}
                        {record.mileage?.toLocaleString('pt-BR')} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-amber-400">
                      {formatCurrency(record.price || 0)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRecord(record)}
                        title="Editar Atendimento"
                      >
                        <Edit2 className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRecordToDelete(record)}
                        title="Excluir Atendimento"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Previsão do Próximo Retorno */}
                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Próximo Retorno:</strong>{' '}
                      {record.next_return_date ? formatDate(record.next_return_date) : 'Sem data'}{' '}
                      {record.next_return_mileage ? `ou ${record.next_return_mileage.toLocaleString('pt-BR')} km` : ''}
                    </span>
                  </div>

                  {record.status_label && (
                    <span className="px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                      {record.status_label}
                    </span>
                  )}
                </div>

                {record.notes && (
                  <p className="text-xs text-slate-400 italic pt-1">"{record.notes}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição de Atendimento */}
      <ServiceRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => fetchVehicleDetails()}
        organizationId={orgId}
        recordToEdit={recordToEdit}
        presetCustomerId={vehicle.customer_id}
        presetVehicleId={vehicle.id}
      />

      {/* Modal de Editar Veículo */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={vehicle}
        customersList={customersList}
      />

      {/* Modal de Exclusão de Atendimento (Req 19) */}
      <ConfirmDeleteDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDeleteRecord}
        title="Excluir registro de serviço?"
        description="Esse serviço será removido do histórico do veículo e poderá alterar os indicadores de retorno."
        loading={isDeletingRecord}
      />

      {/* Modal de Exclusão de Veículo */}
      <ConfirmDeleteDialog
        isOpen={deletingVehicle}
        onClose={() => setDeletingVehicle(false)}
        onConfirm={handleConfirmDeleteVehicle}
        title="Excluir veículo?"
        description={`Tem certeza que deseja excluir o veículo ${vehicle.brand} ${vehicle.model}?`}
        loading={isDeletingVehicle}
      />
    </div>
  );
}
