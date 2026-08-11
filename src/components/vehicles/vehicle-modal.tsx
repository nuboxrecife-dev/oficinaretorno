'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button, PrimaryButton } from '@/components/ui/button';
import { Vehicle, Customer } from '@/types';
import { Car, Wrench, Calendar, Gauge, Fuel, User, Palette, FileText } from 'lucide-react';
import { formatPlate } from '@/lib/formatters';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Vehicle>) => Promise<void>;
  vehicle?: Vehicle | null;
  customerId?: string;
  customersList?: Customer[];
}

export function VehicleModal({
  isOpen,
  onClose,
  onSave,
  vehicle,
  customerId,
  customersList = [],
}: VehicleModalProps) {
  const isEditing = Boolean(vehicle);

  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState('Flex');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (vehicle) {
      setSelectedCustomerId(vehicle.customer_id || customerId || '');
      setBrand(vehicle.brand || '');
      setModel(vehicle.model || '');
      setYear(vehicle.year ? String(vehicle.year) : '');
      setPlate(vehicle.plate || '');
      setColor(vehicle.color || '');
      setMileage(vehicle.mileage !== undefined ? String(vehicle.mileage) : '0');
      setFuelType(vehicle.fuel_type || 'Flex');
      setNotes(vehicle.notes || '');
    } else {
      setSelectedCustomerId(customerId || (customersList[0]?.id || ''));
      setBrand('');
      setModel('');
      setYear(new Date().getFullYear().toString());
      setPlate('');
      setColor('');
      setMileage('0');
      setFuelType('Flex');
      setNotes('');
    }
    setErrorMessage('');
  }, [vehicle, customerId, customersList, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedCustomerId) {
      setErrorMessage('Selecione o proprietário do veículo.');
      return;
    }

    if (!brand.trim()) {
      setErrorMessage('A marca do veículo é obrigatória.');
      return;
    }

    if (!model.trim()) {
      setErrorMessage('O modelo do veículo é obrigatório.');
      return;
    }

    const numericMileage = Math.max(0, parseInt(mileage || '0', 10) || 0);

    setIsLoading(true);
    try {
      await onSave({
        id: vehicle?.id,
        customer_id: selectedCustomerId,
        brand: brand.trim(),
        model: model.trim(),
        year: year ? parseInt(year, 10) : undefined,
        plate: plate ? formatPlate(plate) : undefined,
        color: color.trim() || undefined,
        mileage: numericMileage,
        fuel_type: fuelType,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao salvar veículo.');
    } finally {
      setIsLoading(false);
    }
  };

  const fuelOptions = [
    { value: 'Flex', label: 'Flex (Gasolina/Etanol)' },
    { value: 'Gasolina', label: 'Gasolina' },
    { value: 'Etanol', label: 'Etanol' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Híbrido', label: 'Híbrido' },
    { value: 'Elétrico', label: 'Elétrico' },
    { value: 'GNV', label: 'GNV' },
    { value: 'Outro', label: 'Outro' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Veículo' : '+ Adicionar Veículo'}
      footer={
        <>
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancelar
          </Button>
          <PrimaryButton onClick={handleSubmit} isLoading={isLoading} className="font-bold">
            Salvar veículo
          </PrimaryButton>
        </>
      }
    >
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Proprietário (se não fixo) */}
        {!customerId && customersList.length > 0 && (
          <Select
            label="Proprietário (Cliente) *"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            options={customersList.map((c) => ({ value: c.id, label: c.name }))}
            icon={<User className="w-4 h-4" />}
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Marca *"
            placeholder="Ex: Toyota, Honda, VW"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            icon={<Car className="w-4 h-4" />}
            required
          />

          <Input
            label="Modelo *"
            placeholder="Ex: Corolla, Civic, Golf"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            icon={<Wrench className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Placa (Mercosul ou Tradicional)"
            placeholder="Ex: ABC1D23"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            icon={<Car className="w-4 h-4 text-brand-600" />}
          />

          <Input
            label="Ano de Fabricação/Modelo"
            type="number"
            placeholder="Ex: 2022"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Quilometragem Atual (km)"
            type="number"
            placeholder="Ex: 87500"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            icon={<Gauge className="w-4 h-4" />}
          />

          <Select
            label="Tipo de Combustível"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            options={fuelOptions}
            icon={<Fuel className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Cor do Veículo"
          placeholder="Ex: Prata, Preto, Branco"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          icon={<Palette className="w-4 h-4" />}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Observações do Veículo
          </label>
          <textarea
            rows={2}
            placeholder="Detalhes mecânicos, estado de conservação, observações do motor..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          />
        </div>
      </form>
    </Modal>
  );
}
