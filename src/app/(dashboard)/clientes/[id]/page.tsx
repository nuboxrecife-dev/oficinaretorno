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
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { CustomerWithVehicles, Vehicle } from '@/types';
import { getCustomerById, saveCustomer, saveVehicle, deleteVehicle } from '@/services/data-service';
import { formatPhone, formatDate, formatCpfCnpj, formatMileage, formatPlate } from '@/lib/formatters';
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
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { organization } = useAuth();
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerWithVehicles | null>(null);

  // Modais
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Exclusão de veículo
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  const fetchCustomerDetails = useCallback(async () => {
    if (!organization?.id || !customerId) return;
    setLoading(true);
    try {
      const data = await getCustomerById(customerId, organization.id);
      setCustomer(data);
    } catch (err) {
      console.error('Erro ao carregar detalhes do cliente:', err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, customerId]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleSaveCustomer = async (data: any) => {
    if (!organization?.id) return;
    await saveCustomer(organization.id, data);
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
    if (!organization?.id) return;
    await saveVehicle(organization.id, data);
    fetchCustomerDetails();
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!deletingVehicle || !organization?.id) return;
    setIsDeletingVehicle(true);
    try {
      await deleteVehicle(deletingVehicle.id, organization.id);
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 my-6">
        <LoadingState message="Buscando informações do cliente..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para lista de clientes
        </Link>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm">
              {customer.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{customer.name}</h1>
                <StatusBadge
                  status={customer.status === 'active' ? 'em_3_dias' : 'atrasado'}
                  label={customer.status === 'active' ? 'Ativo' : 'Inativo'}
                />
              </div>

              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600 pt-1">
                {customer.whatsapp && (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    {formatPhone(customer.whatsapp)}
                  </span>
                )}
                {customer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {formatPhone(customer.phone)}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {customer.email}
                  </span>
                )}
                {customer.cpf_cnpj && (
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    {formatCpfCnpj(customer.cpf_cnpj)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsCustomerModalOpen(true)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Editar cliente
            </Button>

            <PrimaryButton onClick={handleAddVehicle} leftIcon={<Plus className="w-4 h-4" />}>
              Adicionar veículo
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* 2. Cards Resumo do Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Veículos</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold text-slate-900">{customer.vehicles_count}</h3>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Car className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Serviços realizados</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold text-slate-400">0</h3>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Próximo retorno</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nenhum programado</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Receita gerada</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold text-slate-400">R$ 0,00</h3>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Observações adicionais */}
      {customer.notes && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <h4 className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" /> Observações do cliente
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">{customer.notes}</p>
        </div>
      )}

      {/* 3. Seção de Veículos do Cliente */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Veículos do cliente</h2>
            <p className="text-xs text-slate-500">
              Frota cadastrada pertencente a {customer.name}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddVehicle} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            + Adicionar veículo
          </Button>
        </div>

        {customer.vehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo cadastrado"
            description="Os veículos cadastrados para este cliente aparecerão aqui."
            actionText="Adicionar veículo"
            onAction={handleAddVehicle}
            icon={<Car className="w-10 h-10 text-brand-600" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {v.brand} {v.model}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{v.year ? `Ano ${v.year}` : 'Ano não informado'}</p>
                    </div>

                    {v.plate && (
                      <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg uppercase tracking-wider">
                        {formatPlate(v.plate)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quilometragem</span>
                      <span className="font-bold text-slate-800">{formatMileage(v.mileage)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Combustível</span>
                      <span className="font-medium text-slate-800">{v.fuel_type || 'N/I'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link href={`/veiculos/${v.id}`}>
                    <Button size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5 text-brand-600" />}>
                      Ver veículo
                    </Button>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEditVehicle(v)} title="Editar">
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeletingVehicle(v)} title="Excluir">
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
        isLoading={isDeletingVehicle}
      />
    </div>
  );
}
