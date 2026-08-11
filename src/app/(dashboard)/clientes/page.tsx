'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/ui/page-header';
import { Button, PrimaryButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Pagination } from '@/components/ui/pagination';
import { CustomerModal } from '@/components/customers/customer-modal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { CustomerWithVehicles, PaginatedResult } from '@/types';
import { getCustomers, saveCustomer, deleteCustomer } from '@/services/data-service';
import { formatPhone, formatDate, formatCpfCnpj } from '@/lib/formatters';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Car,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';

export default function ClientesPage() {
  const router = useRouter();
  const { organization } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<CustomerWithVehicles>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 25,
    totalPages: 1,
  });

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'with' | 'without'>('all');
  const [page, setPage] = useState(1);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithVehicles | null>(null);

  // Modal de Exclusão
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerWithVehicles | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const result = await getCustomers(organization.id, {
        query: searchQuery,
        status: statusFilter,
        hasVehicle: vehicleFilter,
        page,
        pageSize: 25,
      });
      setPaginatedData(result);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, searchQuery, statusFilter, vehicleFilter, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: CustomerWithVehicles, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (customer: CustomerWithVehicles, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCustomer(customer);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer || !organization?.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCustomer(deletingCustomer.id, organization.id);
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      setDeleteError(err?.message || 'Erro ao excluir cliente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveCustomer = async (data: any) => {
    if (!organization?.id) return;
    await saveCustomer(organization.id, data);
    fetchCustomers();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header com CTA + Novo Cliente */}
      <PageHeader
        title="Clientes"
        subtitle="Gerencie os clientes da sua oficina e acompanhe seus veículos."
        actions={
          <PrimaryButton
            onClick={handleCreateNew}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="font-bold"
          >
            + Novo cliente
          </PrimaryButton>
        }
      />

      {/* 2. Filtros e Busca */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 lg:col-span-6">
          <Input
            placeholder="Buscar por nome, WhatsApp, e-mail ou CPF/CNPJ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="sm:col-span-3 lg:col-span-3">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'Status: Todos' },
              { value: 'active', label: 'Status: Ativos' },
              { value: 'inactive', label: 'Status: Inativos' },
            ]}
            icon={<Filter className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="sm:col-span-3 lg:col-span-3">
          <Select
            value={vehicleFilter}
            onChange={(e) => {
              setVehicleFilter(e.target.value as any);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'Veículos: Todos' },
              { value: 'with', label: 'Com Veículo' },
              { value: 'without', label: 'Sem Veículo' },
            ]}
            icon={<Car className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* 3. Listagem Principal */}
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12">
          <LoadingState message="Carregando clientes da oficina..." />
        </div>
      ) : paginatedData.data.length === 0 ? (
        searchQuery || statusFilter !== 'all' || vehicleFilter !== 'all' ? (
          <EmptyState
            title="Nenhum resultado encontrado"
            description="Tente alterar sua busca ou os filtros para encontrar o cliente."
            icon={<Search className="w-10 h-10 text-slate-400" />}
          />
        ) : (
          <EmptyState
            title="Nenhum cliente cadastrado ainda"
            description="Cadastre seu primeiro cliente para começar a organizar os retornos da sua oficina."
            actionText="Cadastrar primeiro cliente"
            onAction={handleCreateNew}
            icon={<Users className="w-10 h-10 text-brand-600" />}
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
                    <th className="px-6 py-3.5">Cliente</th>
                    <th className="px-6 py-3.5">WhatsApp / Telefone</th>
                    <th className="px-6 py-3.5">Veículos</th>
                    <th className="px-6 py-3.5">Última atualização</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {paginatedData.data.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/clientes/${c.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 border border-brand-100">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 hover:text-brand-600 transition-colors">
                              {c.name}
                            </p>
                            {c.cpf_cnpj && (
                              <p className="text-xs text-slate-400">{formatCpfCnpj(c.cpf_cnpj)}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {c.whatsapp ? (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{formatPhone(c.whatsapp)}</span>
                          </div>
                        ) : c.phone ? (
                          <span className="text-slate-600">{formatPhone(c.phone)}</span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sem telefone</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Car className="w-3.5 h-3.5 text-slate-500" />
                          {c.vehicles_count === 1 ? '1 veículo' : `${c.vehicles_count} veículos`}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(c.updated_at || c.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={c.status === 'active' ? 'em_3_dias' : 'atrasado'}
                          label={c.status === 'active' ? 'Ativo' : 'Inativo'}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/clientes/${c.id}`);
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEdit(c, e)}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-slate-500 hover:text-brand-600" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(c, e)}
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
              {paginatedData.data.map((c) => (
                <div
                  key={c.id}
                  onClick={() => router.push(`/clientes/${c.id}`)}
                  className="p-4 space-y-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-sm font-bold border border-brand-100">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                        {c.whatsapp && (
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            {formatPhone(c.whatsapp)}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge
                      status={c.status === 'active' ? 'em_3_dias' : 'atrasado'}
                      label={c.status === 'active' ? 'Ativo' : 'Inativo'}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      {c.vehicles_count === 1 ? '1 veículo' : `${c.vehicles_count} veículos`}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleEdit(c, e)}
                        className="h-8 px-2 text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/clientes/${c.id}`);
                        }}
                        className="h-8 px-2 text-xs font-bold text-brand-600"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
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

      {/* Modal de Formulário (Novo / Editar) */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      {/* Modal de Confirmação de Exclusão Segura */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir cliente?"
        description={`Tem certeza que deseja excluir o cliente ${deletingCustomer?.name}? Essa ação não poderá ser desfeita.`}
        isBlocked={Boolean(deletingCustomer && deletingCustomer.vehicles_count > 0)}
        blockReason={
          deleteError ||
          'Este cliente possui veículos cadastrados. Remova ou transfira os veículos antes de excluir o cliente.'
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
