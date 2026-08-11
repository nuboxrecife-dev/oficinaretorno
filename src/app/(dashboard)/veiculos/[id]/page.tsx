'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button, PrimaryButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { VehicleModal } from '@/components/vehicles/vehicle-modal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { VehicleWithCustomer, Customer } from '@/types';
import { getVehicleById, saveVehicle, deleteVehicle, getCustomers } from '@/services/data-service';
import { formatPlate, formatMileage, formatPhone } from '@/lib/formatters';
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
} from 'lucide-react';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { organization } = useAuth();
  const vehicleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<VehicleWithCustomer | null>(null);
  const [customersList, setCustomersList] = useState<Customer[]>([]);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehicleDetails = useCallback(async () => {
    if (!organization?.id || !vehicleId) return;
    setLoading(true);
    try {
      const data = await getVehicleById(vehicleId, organization.id);
      setVehicle(data);

      const custResult = await getCustomers(organization.id, { pageSize: 100 });
      setCustomersList(custResult.data);
    } catch (err) {
      console.error('Erro ao buscar detalhes do veículo:', err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, vehicleId]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  const handleSaveVehicle = async (data: any) => {
    if (!organization?.id) return;
    await saveVehicle(organization.id, data);
    fetchVehicleDetails();
  };

  const handleConfirmDelete = async () => {
    if (!vehicle || !organization?.id) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(vehicle.id, organization.id);
      router.push('/veiculos');
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 my-6">
        <LoadingState message="Buscando informações do veículo..." />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <Link
          href="/veiculos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para lista de veículos
        </Link>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Car className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.plate && (
                  <span className="px-3 py-1 bg-slate-900 text-white font-mono font-bold text-sm rounded-lg uppercase tracking-wider">
                    {formatPlate(vehicle.plate)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Ano: {vehicle.year || 'Não informado'}
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Gauge className="w-3.5 h-3.5 text-brand-600" />
                  {formatMileage(vehicle.mileage)}
                </span>
                <span className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  {vehicle.fuel_type || 'Combustível N/I'}
                </span>
                {vehicle.color && (
                  <span className="flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    {vehicle.color}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Editar veículo
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeletingVehicle(true)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Card do Proprietário (Cliente) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" /> Proprietário do Veículo
          </h3>
          {vehicle.customer && (
            <Link href={`/clientes/${vehicle.customer.id}`}>
              <PrimaryButton size="sm" variant="outline" className="font-bold">
                Ver cliente
              </PrimaryButton>
            </Link>
          )}
        </div>

        {vehicle.customer ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                {vehicle.customer.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{vehicle.customer.name}</h4>
                {vehicle.customer.whatsapp && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    {formatPhone(vehicle.customer.whatsapp)}
                  </p>
                )}
              </div>
            </div>

            <Link href={`/clientes/${vehicle.customer.id}`}>
              <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                Acessar Ficha do Cliente
              </Button>
            </Link>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Nenhum proprietário associado a este veículo.</p>
        )}
      </div>

      {/* 3. Área de Serviços do Veículo (Histórico) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Histórico de serviços</h2>
            <p className="text-xs text-slate-500">
              Registros de manutenções e trocas efetuadas neste veículo.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
            <Clock className="w-3.5 h-3.5" />
            Disponível na próxima etapa
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-subtle space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Wrench className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum serviço registrado</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Os serviços realizados neste veículo aparecerão aqui. O módulo completo de Ordens de Serviço e Histórico de Manutenção será configurado na Etapa 3.
            </p>
          </div>
          <Button disabled variant="outline" className="opacity-60 cursor-not-allowed text-xs">
            + Registrar novo serviço (Próxima etapa)
          </Button>
        </div>
      </div>

      {/* Modal de Editar Veículo */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={vehicle}
        customersList={customersList}
      />

      {/* Modal de Exclusão de Veículo */}
      <ConfirmDeleteDialog
        isOpen={deletingVehicle}
        onClose={() => setDeletingVehicle(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir veículo?"
        description={`Tem certeza que deseja excluir o veículo ${vehicle.brand} ${vehicle.model}?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
