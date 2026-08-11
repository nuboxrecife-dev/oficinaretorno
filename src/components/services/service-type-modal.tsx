'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceType } from '@/types';
import { saveServiceType } from '@/services/data-service';

interface ServiceTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (serviceType: ServiceType) => void;
  organizationId: string;
  serviceTypeToEdit?: ServiceType | null;
}

export function ServiceTypeModal({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  serviceTypeToEdit,
}: ServiceTypeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultIntervalMonths, setDefaultIntervalMonths] = useState<string>('6');
  const [defaultIntervalKm, setDefaultIntervalKm] = useState<string>('10000');
  const [defaultPrice, setDefaultPrice] = useState<string>('250');
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceTypeToEdit) {
      setName(serviceTypeToEdit.name || '');
      setDescription(serviceTypeToEdit.description || '');
      setDefaultIntervalMonths(
        serviceTypeToEdit.default_interval_months !== undefined ? String(serviceTypeToEdit.default_interval_months) : ''
      );
      setDefaultIntervalKm(
        serviceTypeToEdit.default_interval_km !== undefined ? String(serviceTypeToEdit.default_interval_km) : ''
      );
      setDefaultPrice(
        serviceTypeToEdit.default_price !== undefined ? String(serviceTypeToEdit.default_price) : ''
      );
      setActive(serviceTypeToEdit.active !== undefined ? serviceTypeToEdit.active : true);
    } else {
      setName('');
      setDescription('');
      setDefaultIntervalMonths('6');
      setDefaultIntervalKm('10000');
      setDefaultPrice('250');
      setActive(true);
    }
    setError(null);
  }, [serviceTypeToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do serviço é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const saved = await saveServiceType(organizationId, {
        id: serviceTypeToEdit?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        default_interval_months: defaultIntervalMonths ? Number(defaultIntervalMonths) : undefined,
        default_interval_km: defaultIntervalKm ? Number(defaultIntervalKm) : undefined,
        default_price: defaultPrice ? Number(defaultPrice) : 0,
        active,
      });

      onSuccess(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar serviço no catálogo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={serviceTypeToEdit ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}
      description="Configure o serviço oferecido e os intervalos recomendados para o retorno preventivo."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Nome do Serviço <span className="text-red-400">*</span>
          </label>
          <Input
            placeholder="Ex: Troca de óleo, Revisão de Freios"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
          <textarea
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            rows={2}
            placeholder="Detalhes ou itens inclusos neste serviço..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Intervalo em Meses (Tempo)
            </label>
            <Input
              type="number"
              min="0"
              placeholder="Ex: 6"
              value={defaultIntervalMonths}
              onChange={(e) => setDefaultIntervalMonths(e.target.value)}
            />
            <p className="text-[11px] text-slate-500 mt-1">Recomendado para próximo retorno</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Intervalo em KM (Quilometragem)
            </label>
            <Input
              type="number"
              min="0"
              placeholder="Ex: 10000"
              value={defaultIntervalKm}
              onChange={(e) => setDefaultIntervalKm(e.target.value)}
            />
            <p className="text-[11px] text-slate-500 mt-1">Recomendado para próximo retorno</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Preço Padrão (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 250.00"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="activeStatus"
                  checked={active === true}
                  onChange={() => setActive(true)}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-200">Ativo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="activeStatus"
                  checked={active === false}
                  onChange={() => setActive(false)}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-400">Inativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar serviço
          </Button>
        </div>
      </form>
    </Modal>
  );
}
