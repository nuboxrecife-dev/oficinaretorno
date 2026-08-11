'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/ui/page-header';
import { Button, PrimaryButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Pagination } from '@/components/ui/pagination';
import { VehicleModal } from '@/components/vehicles/vehicle-modal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { VehicleWithCustomer, Customer, PaginatedResult } from '@/types';
import { getVehicles, saveVehicle, deleteVehicle, getCustomers } from '@/services/data-service';
import { formatPlate, formatMileage, formatDate } from '@/lib/formatters';
import {
  Car,
  Plus,
  Search,
  User,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Gauge,
} from 'lucide-react';

export default function VeiculosPage() {
  const router = useRouter();
  const { organization } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<VehicleWithCustomer>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 25,
    totalPages: 1,
  });

  const [customersList, setCustomersList] = useState<Customer[]>([]);

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithCustomer | null>(null);

  // Modal de Exclusão
  const [deletingVehicle, setDeletingVehicle] = useState<VehicleWithCustomer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const result = await getVehicles(organization.id, {
        query: searchQuery,
        page,
        pageSize: 25,
      });
      setPaginatedData(result);

      // Carregar lista de clientes para seleção nos formulários
      const custResult = await getCustomers(organization.id, { pageSize: 100 });
      setCustomersList(custResult.data);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, searchQuery, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleCreateNew = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: VehicleWithCustomer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (vehicle: VehicleWithCustomer, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingVehicle(vehicle);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVehicle || !organization?.id) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(deletingVehicle.id, organization.id);
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveVehicle = async (data: any) => {
    if (!organization?.id) return;
    await saveVehicle(organization.id, data);
    fetchVehicles();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header com CTA + Adicionar Veículo */}
      <PageHeader
        title="Veículos"
        subtitle="Consulte todos os veículos cadastrados na sua oficina."
        actions={
          <PrimaryButton
            onClick={handleCreateNew}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold"
          >
            + Adicionar veículo
          </PrimaryButton>
        }
      />

      {/* 2. Busca */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-subtle">
        <Input
          placeholder="Buscar por placa, marca, modelo ou nome do proprietário..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* 3. Listagem Principal */}
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12">
          <LoadingState message="Carregando frota cadastrada..." />
        </div>
      ) : paginatedData.data.length === 0 ? (
        searchQuery ? (
          <EmptyState
            title="Nenhum resultado encontrado"
            description="Tente alterar sua busca para encontrar o veículo."
            icon={<Search className="w-10 h-10 text-slate-400" />}
          />
        ) : (
          <EmptyState
            title="Nenhum veículo cadastrado"
            description="Os veículos dos seus clientes aparecerão aqui."
            actionText="Cadastrar primeiro veículo"
            onAction={handleCreateNew}
            icon={<Car className="w-10 h-10 text-brand-600" />}
          />
        )
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-subtle overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Veículo</th>
                    <th className="px-6 py-3.5">Placa</th>
                    <th className="px-6 py-3.5">Proprietário</th>
                    <th className="px-6 py-3.5">Ano</th>
                    <th className="px-6 py-3.5">Quilometragem</th>
                    <th className="px-6 py-3.5">Última atualização</th>
                    <th className="px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {paginatedData.data.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => router.push(`/veiculos/${v.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <Car className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 hover:text-brand-600 transition-colors">
                              {v.brand} {v.model}
                            </p>
                            {v.color && <p className="text-xs text-slate-400">{v.color}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {v.plate ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-900 rounded border border-slate-200 text-xs">
                            {formatPlate(v.plate)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs font-sans">Sem placa</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {v.customer ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{v.customer.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sem proprietário</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-xs font-semibold">
                        {v.year || '—'}
                      </td>

                      <td className="px-6 py-4 text-slate-800 font-semibold text-xs">
                        {formatMileage(v.mileage)}
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(v.updated_at || v.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/veiculos/${v.id}`);
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEdit(v, e)}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-slate-500 hover:text-brand-600" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(v, e)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedData.data.map((v) => (
                <div
                  key={v.id}
                  onClick={() => router.push(`/veiculos/${v.id}`)}
                  className="p-4 space-y-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {v.brand} {v.model}
                      </h4>
                      {v.customer && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          {v.customer.name}
                        </p>
                      )}
                    </div>

                    {v.plate && (
                      <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded uppercase">
                        {formatPlate(v.plate)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-50">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quilometragem</span>
                      <span className="font-bold text-slate-800">{formatMileage(v.mileage)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ano</span>
                      <span className="font-semibold text-slate-800">{v.year || '—'}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleEdit(v, e)}
                      className="h-8 px-2 text-xs"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/veiculos/${v.id}`);
                      }}
                      className="h-8 px-2 text-xs font-bold text-brand-600"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pagination
            page={paginatedData.page}
            totalPages={paginatedData.totalPages}
            totalItems={paginatedData.total}
            pageSize={paginatedData.pageSize}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Modal de Formulário de Veículo */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={editingVehicle}
        customersList={customersList}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingVehicle)}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir veículo?"
        description={`Tem certeza que deseja excluir o veículo ${deletingVehicle?.brand} ${deletingVehicle?.model}?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
