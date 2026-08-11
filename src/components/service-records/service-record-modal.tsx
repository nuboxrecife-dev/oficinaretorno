'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CustomerWithVehicles,
  VehicleWithCustomer,
  ServiceType,
  ServiceRecordWithDetails,
} from '@/types';
import {
  getCustomers,
  getVehicles,
  getServiceTypes,
  saveServiceRecord,
  calculateNextReturn,
} from '@/services/data-service';
import { formatCurrency } from '@/lib/formatters';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface ServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: ServiceRecordWithDetails) => void;
  organizationId: string;
  recordToEdit?: ServiceRecordWithDetails | null;
  presetCustomerId?: string;
  presetVehicleId?: string;
}

export function ServiceRecordModal({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  recordToEdit,
  presetCustomerId,
  presetVehicleId,
}: ServiceRecordModalProps) {
  const [customers, setCustomers] = useState<CustomerWithVehicles[]>([]);
  const [vehicles, setVehicles] = useState<VehicleWithCustomer[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>('');

  const [serviceDate, setServiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [mileage, setMileage] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [nextReturnDate, setNextReturnDate] = useState<string>('');
  const [nextReturnMileage, setNextReturnMileage] = useState<string>('');
  const [isAutoCalculated, setIsAutoCalculated] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Carregar dados de seleção
  useEffect(() => {
    async function loadData() {
      if (!isOpen) return;
      setFetching(true);
      try {
        const [custRes, vehRes, stRes] = await Promise.all([
          getCustomers(organizationId, { pageSize: 100 }),
          getVehicles(organizationId, { pageSize: 100 }),
          getServiceTypes(organizationId, { activeOnly: true }),
        ]);

        setCustomers(custRes.data);
        setVehicles(vehRes.data);
        setServiceTypes(stRes);
      } catch (err) {
        console.error('Erro ao carregar dados no modal de atendimento:', err);
      } finally {
        setFetching(false);
      }
    }

    loadData();
  }, [isOpen, organizationId]);

  // Inicializar estado do formulário
  useEffect(() => {
    if (!isOpen) return;

    if (recordToEdit) {
      setSelectedCustomerId(recordToEdit.customer_id || '');
      setSelectedVehicleId(recordToEdit.vehicle_id || '');
      setSelectedServiceTypeId(recordToEdit.service_type_id || '');
      setServiceDate(recordToEdit.service_date || new Date().toISOString().split('T')[0]);
      setMileage(String(recordToEdit.mileage || ''));
      setPrice(String(recordToEdit.price || ''));
      setNotes(recordToEdit.notes || '');
      setNextReturnDate(recordToEdit.next_return_date || '');
      setNextReturnMileage(recordToEdit.next_return_mileage ? String(recordToEdit.next_return_mileage) : '');
      setIsAutoCalculated(false);
    } else {
      const custId = presetCustomerId || '';
      setSelectedCustomerId(custId);

      if (presetVehicleId) {
        setSelectedVehicleId(presetVehicleId);
      } else if (custId) {
        // Atalho: Se o cliente tem apenas 1 veículo, seleciona automaticamente (Req 40)
        const custVehicles = vehicles.filter((v) => v.customer_id === custId);
        if (custVehicles.length === 1) {
          setSelectedVehicleId(custVehicles[0].id);
          setMileage(custVehicles[0].mileage ? String(custVehicles[0].mileage) : '');
        }
      } else {
        setSelectedVehicleId('');
        setMileage('');
      }

      setSelectedServiceTypeId('');
      setServiceDate(new Date().toISOString().split('T')[0]);
      setPrice('');
      setNotes('');
      setNextReturnDate('');
      setNextReturnMileage('');
      setIsAutoCalculated(true);
    }

    setError(null);
    setSuccessToast(null);
  }, [isOpen, recordToEdit, presetCustomerId, presetVehicleId, vehicles]);

  // Atualizar veículos disponíveis ao alterar cliente
  const currentCustomerVehicles = vehicles.filter(
    (v) => v.customer_id === selectedCustomerId
  );

  // Ao selecionar um tipo de serviço, preencher sugestões de preço, meses e km (Req 10)
  const handleServiceTypeChange = (stId: string) => {
    setSelectedServiceTypeId(stId);
    const st = serviceTypes.find((t) => t.id === stId);
    if (!st) return;

    if (!price || price === '0') {
      setPrice(String(st.default_price || ''));
    }

    // Auto recalcular próxima data e km
    recalculateReturn(serviceDate, mileage, st);
  };

  // Recalcular retorno preventivo
  const recalculateReturn = (dateStr: string, kmStr: string, stOverride?: ServiceType) => {
    const st = stOverride || serviceTypes.find((t) => t.id === selectedServiceTypeId);
    if (!st) return;

    const currentKm = Number(kmStr) || 0;
    const calc = calculateNextReturn(
      dateStr || new Date().toISOString().split('T')[0],
      currentKm,
      st.default_interval_months,
      st.default_interval_km
    );

    if (calc.nextReturnDate) setNextReturnDate(calc.nextReturnDate);
    if (calc.nextReturnMileage !== undefined) setNextReturnMileage(String(calc.nextReturnMileage));
    setIsAutoCalculated(true);
  };

  // Ao selecionar um veículo, sugerir a KM atual
  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const veh = vehicles.find((v) => v.id === vId);
    if (veh && veh.mileage) {
      setMileage(String(veh.mileage));
      recalculateReturn(serviceDate, String(veh.mileage));
    }
  };

  // Veículo atualmente selecionado para verificação de quilometragem
  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicleId);
  const isMileageLowerThanVehicle = Boolean(
    selectedVehicleObj &&
      selectedVehicleObj.mileage &&
      Number(mileage) > 0 &&
      Number(mileage) < selectedVehicleObj.mileage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Selecione um cliente.');
      return;
    }
    if (!selectedVehicleId) {
      setError('Selecione um veículo.');
      return;
    }
    if (!mileage || Number(mileage) < 0) {
      setError('Informe a quilometragem do atendimento.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const saved = await saveServiceRecord(organizationId, {
        id: recordToEdit?.id,
        customer_id: selectedCustomerId,
        vehicle_id: selectedVehicleId,
        service_type_id: selectedServiceTypeId || undefined,
        service_date: serviceDate,
        mileage: Number(mileage),
        price: price ? Number(price) : 0,
        notes: notes.trim() || undefined,
        next_return_date: nextReturnDate || undefined,
        next_return_mileage: nextReturnMileage ? Number(nextReturnMileage) : undefined,
      });

      // Feedback visual (Req 41)
      let returnMsg = 'Serviço registrado com sucesso.';
      if (saved.next_return_date || saved.next_return_mileage) {
        const parts = [];
        if (saved.next_return_date) {
          parts.push(`Data: ${saved.next_return_date.split('-').reverse().join('/')}`);
        }
        if (saved.next_return_mileage) {
          parts.push(`KM: ${saved.next_return_mileage.toLocaleString('pt-BR')} km`);
        }
        returnMsg += ` Próximo retorno agendado (${parts.join(' ou ')}).`;
      }
      setSuccessToast(returnMsg);

      setTimeout(() => {
        onSuccess(saved);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar serviço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? 'Editar Atendimento' : 'Registrar Serviço / Atendimento'}
      description="Informe os dados da manutenção realizada no veículo para agendamento automático do retorno."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successToast && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Seleção do Cliente e Veículo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Cliente <span className="text-red-400">*</span>
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setSelectedVehicleId('');
              }}
              required
              disabled={Boolean(presetCustomerId) || fetching}
            >
              <option value="">-- Selecione o Cliente --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.whatsapp ? `(${c.whatsapp})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Veículo <span className="text-red-400">*</span>
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              required
              disabled={!selectedCustomerId || Boolean(presetVehicleId) || fetching}
            >
              <option value="">
                {selectedCustomerId ? '-- Selecione o Veículo --' : 'Selecione primeiro o cliente'}
              </option>
              {currentCustomerVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.plate ? `[${v.plate}]` : ''} ({v.mileage?.toLocaleString('pt-BR')} km)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seleção do Serviço do Catálogo */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Serviço Realizado (Catálogo)
          </label>
          <select
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
            value={selectedServiceTypeId}
            onChange={(e) => handleServiceTypeChange(e.target.value)}
          >
            <option value="">-- Serviço personalizado ou selecione do catálogo --</option>
            {serviceTypes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} - {formatCurrency(st.default_price || 0)} (Retorno: {st.default_interval_months || 0}m / {st.default_interval_km?.toLocaleString('pt-BR') || 0} km)
              </option>
            ))}
          </select>
        </div>

        {/* Data, Quilometragem e Valor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Data do Serviço <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={serviceDate}
              onChange={(e) => {
                setServiceDate(e.target.value);
                recalculateReturn(e.target.value, mileage);
              }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quilometragem (KM) <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              min="0"
              placeholder="Ex: 90000"
              value={mileage}
              onChange={(e) => {
                setMileage(e.target.value);
                recalculateReturn(serviceDate, e.target.value);
              }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Valor Cobrado (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 350.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Alerta de Quilometragem Menor (Req 14 & Cenário C) */}
        {isMileageLowerThanVehicle && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-xs text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Atenção:</strong> A quilometragem informada ({Number(mileage).toLocaleString('pt-BR')} km) é menor que a quilometragem atual cadastrada no veículo ({selectedVehicleObj?.mileage?.toLocaleString('pt-BR')} km). Verifique o valor digitado. A quilometragem do veículo não será reduzida.
            </div>
          </div>
        )}

        {/* Seção Próximo Retorno Preventivo */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Previsão do Próximo Retorno
            </span>

            {isAutoCalculated && (
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                Calculado com base no intervalo deste serviço
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Próxima Data (Meses)
              </label>
              <Input
                type="date"
                value={nextReturnDate}
                onChange={(e) => {
                  setNextReturnDate(e.target.value);
                  setIsAutoCalculated(false);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Próxima Quilometragem (KM)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 100000"
                value={nextReturnMileage}
                onChange={(e) => {
                  setNextReturnMileage(e.target.value);
                  setIsAutoCalculated(false);
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Observações do Atendimento</label>
          <textarea
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            rows={2}
            placeholder="Detalhes adicionais do serviço realizado ou recomendações..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {recordToEdit ? 'Atualizar Atendimento' : 'Registrar Serviço'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
